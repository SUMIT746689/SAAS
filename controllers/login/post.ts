import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { refresh_token_varify } from 'utilities_api/jwtVerify';
import prisma from '@/lib/prisma_client';
import { dcrypt, encrypt } from 'utilities_api/hashing';
import { makeCookie } from 'utilities_api/handleCookies';
import { logFile } from 'utilities_api/handleLogFile';

export default async function post(req, res) {
  try {
    let query = {}
    const { user_id, username, password } = req.body;
    const { academic_year: academic_year_cookie } = req.cookies;

    let dcrypt_cookie: any = [null, null];
    if (academic_year_cookie) dcrypt_cookie = dcrypt(academic_year_cookie)

    const request_refresh_token: any = (req.cookies.refresh_token && user_id) ? refresh_token_varify(req.cookies.refresh_token) : null;

    if (request_refresh_token) {
      //for super admin and admin login there available users 
      // if (request_refresh_token && (request_refresh_token.role?.title === 'ADMIN' || request_refresh_token.role?.title === 'ASSIST_SUPER_ADMIN')) {
      // console.log(request_refresh_token);

      //superadmin login as admin
      if (
        request_refresh_token
        &&
        (request_refresh_token.role?.title === 'SUPER_ADMIN' || request_refresh_token.role?.title === 'ASSIST_SUPER_ADMIN' || request_refresh_token.role?.title === 'ADMIN')
      ) query = { id: user_id };
      else throw new Error('invalid user');

    }
    else {
      if (!username || !password) throw new Error(`provide username and password`);
      else query = { username, is_enabled: true }
    }

    const user = await prisma.user.findFirst({
      where: { ...query },
      include: {
        permissions: true,
        adminPanel: true,
        role: {
          include: {
            permissions: true
          }
        },
        user_role: true,
        school: {
          include: {
            subscription: {
              where: { is_active: true },
              include: { package: true }
            },
            academic_years: {
              orderBy: {
                id: 'desc'
              },
              take: 1
            }
          }
        }
      }
    });
    
    if (!user) throw new Error(`Invalid Authorization`);

    // admin_panel domain verification
    const { adminPanel } = user;
    const host = req.headers.host;

    if (user.user_role.title !== "SUPER_ADMIN") {
      if (!adminPanel?.is_active) throw new Error("Admin Panel is disabled");
      if (host !== adminPanel?.domain) throw new Error("Login using correct domain address");
    }

    if (user_id) {
      if (user.user_role) {
        if (user.user_role.title === 'ASSIST_SUPER_ADMIN' && request_refresh_token.user_role?.title === 'ADMIN') {
          throw new Error('Bad request !');
        }
        else if ((user.user_role.title == 'ADMIN' && request_refresh_token.user_role?.title !== 'ASSIST_SUPER_ADMIN')) {
          throw new Error('Bad request !');
        }
      }
      else {
        if (request_refresh_token.user_role?.title !== 'ADMIN') {
          throw new Error('Bad request !');
        }
      }

    }
    // if (user.role?.title) {
      user['permissions'] = user.role?.id ? user.role.permissions : user.permissions;
      if(user.role) delete user['role']['permissions'];
    // }

    if (user?.user_role?.title !== 'ASSIST_SUPER_ADMIN' && user?.user_role?.title !== 'SUPER_ADMIN') {
      let isSubscriptionActive = false;
      // console.log(user.school?.subscription[0]?.end_date.getTime() + 86400000 > new Date().getTime());
      if (user?.school?.subscription?.length > 0 && user.school?.subscription[0]?.end_date.getTime() + 86400000 > new Date().getTime()) {

        isSubscriptionActive = true;

      }
      else {
        if (user?.user_role?.title === 'ADMIN') {

          isSubscriptionActive = true;
          console.log(isSubscriptionActive, "user?.role?.title__", user?.role?.title,);
          user['permissions'] = user['permissions'].filter(i => i.value === 'package_request')
        }
      }
      if (!isSubscriptionActive) {

        throw new Error('Your subscription has expired or not active');
      }
    }


    //   bcrypt.hash(user.password, Number(process.env.SALTROUNDS), function(err, hash) {
    //     console.log({err,hash})
    // });
    if (req.body.username && req.body.password) {
      const result = await bcrypt.compare(req.body.password, user.password);

      if (!result) throw new Error(`Invalid username or password`);
    }

    const access_token = jwt.sign(
      { name: user.username, id: user.id, school_id: user.school_id, role: user.user_role, admin_panel_id: user.admin_panel_id },
      process.env.JWT_ACCESS_TOKEN_SECRET,
      {
        expiresIn: '5000ms'
      }
    );
    const refresh_token = jwt.sign(
      { name: user.username, id: user.id, school_id: user.school_id, role: user.user_role, admin_panel_id: user.admin_panel_id },
      process.env.JWT_REFRESH_TOKEN_SECRET,
      {
        expiresIn: '1d'
      }
    );

    const cookies = [
      serialize('access_token', access_token, {
        path: '/',
        maxAge: 5,
        secure: process.env.NODE_ENV === 'production'
        // secure: false
      }),
      serialize('refresh_token', refresh_token, {
        path: '/',
        maxAge: 60 * 60 * 24,
        secure: process.env.NODE_ENV === 'production'
        // secure: false
      })
    ];
    const [err, academic_year] = dcrypt_cookie;

    if ((!academic_year_cookie || academic_year?.school_id !== user.school_id) && user?.school?.academic_years && (user.school?.academic_years.length > 0)) {
      const academic_year_cookie_datas = { id: user.school.academic_years[0].id, title: user.school.academic_years[0].title, school_id: user.school.academic_years[0].school_id }
      const encryptData = encrypt(academic_year_cookie_datas);

      const maxAge = 15456432416531;
      cookies.push(makeCookie(serialize, 'academic_year', encryptData, maxAge))
    }
    else if (academic_year?.school_id && academic_year?.school_id !== user.school_id) {
      const maxAge = 0;
      cookies.push(makeCookie(serialize, 'academic_year', '', maxAge))
    }

    res.setHeader('Set-Cookie', cookies);
    delete user['password'];

    res.status(200).json({ user });
  } catch (err) {
    logFile.error(err.message)
    console.log(err);
    res.status(404).json({ err: err.message });
  }
}
