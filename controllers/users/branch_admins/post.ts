import { refresh_token_varify } from 'utilities_api/jwtVerify';
import bcrypt from 'bcrypt';
import { fileUpload } from '@/utils/upload';
import fspromises from 'fs/promises'
import path from 'path';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';

export const post = async (req, res, refresh_token) => {
  try {

    const { role: fetch_req_user_role, admin_panel_id } = refresh_token;

    // if (!req.cookies.refresh_token) throw new Error('refresh token not founds');

    // const refresh_token: any = refresh_token_varify(req.cookies.refresh_token);

    // if (!refresh_token) throw new Error('invalid user');


    const uploadFolderName = "userPhoto";

    const fileType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg']
    // const fileType = ['image/*'];

    const filterFiles = {
      user_photo: fileType,
      logo: fileType
    }

    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName, uniqueFileName: false });

    const { username, password, role, domain, logo, copy_right_txt } = fields;
    const parseRole = JSON.parse(role)

    if (!username || !password || !parseRole.permission)
      throw new Error('provide all required informations');

    const hashPassword = await bcrypt.hash(
      password,
      Number(process.env.SALTROUNDS)
    );

    const user = await prisma.user.findFirst({
      where: { id: refresh_token.id },
      include: {
        permissions: true,
        role: {
          include: {
            permissions: true
          }
        }

      }
    });


    if (!user.permissions.length && user.role_id) {
      user['permissions'] = user.role.permissions;
      delete user['role']['permissions'];
    }
    const findUser = user.permissions.find(
      (permission) => permission.value === parseRole.permission
    );
    if (!findUser) throw Error('Permission denied !')
    const isExist = await prisma.user.findFirst({
      where: {
        username
      }
    })

    if (isExist) throw Error('This username is taken, try another !')
    const data = {
      username: username,
      password: hashPassword,
      adminPanel: {}
    };

    if (fetch_req_user_role?.title !== "SUPER_ADMIN" && domain && logo && copy_right_txt) throw new Error("permission denied for doamin/logo/copy_right fields")
    if (fetch_req_user_role?.title === "SUPER_ADMIN") {
      if (!domain) throw new Error("domain field is required");
      const create_admin_panel = {
        create: {
          domain
        }
      }
      if (files?.logo?.newFilename) create_admin_panel.create["logo"] = path.join(uploadFolderName, files.logo.newFilename);
      if (copy_right_txt) create_admin_panel.create["copy_right_txt"] = copy_right_txt;

      data["adminPanel"] = create_admin_panel;
    }
    else data.adminPanel = { connect: { id: admin_panel_id } }


    if (refresh_token.school_id) data['school'] = {
      connect: { id: parseInt(refresh_token.school_id) }
    }

    const target_role = await prisma.role.findFirst({
      where: {
        title: parseRole.role_title
      },
      include: {
        permissions: true
      }
    })

    data['role'] = {
      connect: { id: target_role.id }
    }
    data['user_role'] = {
      connect: { id: target_role.id }
    }
    if (files?.user_photo?.newFilename) {
      const user_imageNewName = Date.now().toString() + '_' + files.user_photo.originalFilename;
      await fspromises.rename(files.user_photo.filepath, path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, user_imageNewName))
        .then(() => {
          data['user_photo'] = path.join(uploadFolderName, user_imageNewName)

        })
        .catch(err => {
          data['user_photo'] = path.join(uploadFolderName, files.user_photo?.newFilename)
        })

    }


    await prisma.user.create({
      // @ts-ignore
      data,
    });

    res.status(200).json({ message: `${parseRole.role_title} Created Successfully` });
    // res.status(200).json({ data });
  } catch (err) {
    logFile.error(err.message)
    res.status(404).json({ error: err.message });
  }
};
