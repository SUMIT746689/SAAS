import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import prisma from '@/lib/prisma_client';
import { dcrypt, encrypt } from 'utilities_api/hashing';
import { makeCookie } from 'utilities_api/handleCookies';
import { logFile } from 'utilities_api/handleLogFile';
import { authenticate } from 'middleware/authenticate';

const automaticLogin = async (req, res, refresh_token) => {
    try {
        const { id } = req.query;

        const { role, admin_panel_id } = refresh_token;

        const [err, academic_year] = handleGetAcademicYearFromCookie(req)
        if (err) logFile.error("/api/login/automatics/post" + err);

        const resLoginUser = await prisma.user.findFirst({
            where: { id: parseInt(id), deleted_at: null },
            select: {
                id: true,
                username: true,
                school_id: true,
                admin_panel_id: true,
                // role: true,
                is_enabled: true,
                user_role: {
                    select: {
                        title: true
                    }
                },
                adminPanel: {
                    select: { is_active: true }
                },
                school: {
                    select: {
                        id: true,
                        academic_years: {
                            where: { id: academic_year?.id ? academic_year.id : undefined },
                            orderBy: {
                                id: 'desc'
                            },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!resLoginUser) throw new Error("invalid user");
        if (!resLoginUser.is_enabled) throw new Error("user is disabled");
        if (!resLoginUser.adminPanel) throw new Error("admin panel is not founds");
        if (!resLoginUser.adminPanel?.is_active) throw new Error("admin panel is disabled");
        if (admin_panel_id !== resLoginUser?.admin_panel_id) throw new Error("permission denied for different admin panel");

        switch (role?.title) {
            case 'SUPER_ADMIN':
                if (resLoginUser.user_role.title !== "ASSIST_SUPER_ADMIN") throw new Error("permission denied");
                break;
            case 'ASSIST_SUPER_ADMIN':
                if (!["ADMIN", "BRANCH_ADMIN"].includes(resLoginUser.user_role.title)) throw new Error("permission denied");
                break;
            case 'ADMIN':
                if (["SUPER_ADMIN", "ASSIST_SUPER_ADMIN", "ADMIN"].includes(resLoginUser.user_role.title)) throw new Error("permission denied")
                break;
            case 'BRANCH_ADMIN':
                if (["SUPER_ADMIN", "ASSIST_SUPER_ADMIN", "ADMIN"].includes(resLoginUser.user_role.title)) throw new Error("permission denied")
                break;
            default:
                throw new Error("permission denied")
        };

        const academic_year_max_age = (!Array.isArray(resLoginUser.school?.academic_years) || resLoginUser.school?.academic_years.length === 0) ? 0 : 15456432416531;

        const cookies = [
            makeCookie(serialize, 'access_token', handleCreateToken({ user: resLoginUser, secret: process.env.JWT_REFRESH_TOKEN_SECRET, expiresIn: '5000ms' }), 5),
            makeCookie(serialize, 'refresh_token', handleCreateToken({ user: resLoginUser, secret: process.env.JWT_REFRESH_TOKEN_SECRET, expiresIn: '1d' }), 60 * 60 * 24),
            makeCookie(serialize, 'academic_year', handleCreateAcademicYearToken(resLoginUser), academic_year_max_age)
        ];

        res.setHeader('Set-Cookie', cookies);

        res.status(200).json({ resLoginUser });
    } catch (err) {
        logFile.error(err.message)
        res.status(404).json({ error: err.message });
    }
}

export default authenticate(automaticLogin);


const handleCreateToken = ({ user, secret, expiresIn }) => {
    return jwt.sign(
        { name: user.username, id: user.id, school_id: user.school_id, role: user.user_role, admin_panel_id: user.admin_panel_id },
        secret,
        {
            expiresIn
        }
    );
}

const handleGetAcademicYearFromCookie = (request) => {
    const { academic_year: academic_year_cookie } = request.cookies;

    let dcrypt_cookie: any = [null, null];
    if (academic_year_cookie) dcrypt_cookie = dcrypt(academic_year_cookie);
    return dcrypt_cookie;
}
const handleCreateAcademicYearToken = (user) => {
    if (!Array.isArray(user.school?.academic_years) || user.school?.academic_years?.length === 0) return ''
    const academic_year_cookie_datas = { id: user.school.academic_years[0].id, title: user.school.academic_years[0].title, school_id: user.school.academic_years[0].school_id }

    const encryptData = encrypt(academic_year_cookie_datas);
    return encryptData;
}
