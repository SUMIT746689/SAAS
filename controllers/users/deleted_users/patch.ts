import { refresh_token_varify } from 'utilities_api/jwtVerify';
import bcrypt from 'bcrypt';
import { fileUpload } from '@/utils/upload';
import fspromises from 'fs/promises';
import fs from 'fs';
import path from 'path';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';

export const patch = async (req, res, refresh_token) => {
  try {
    const { role: fetch_req_user_role } = refresh_token;
    // if (!req.cookies.refresh_token) throw new Error('refresh token not founds');

    // const refresh_token: any = refresh_token_varify(req.cookies.refresh_token);

    // if (!refresh_token) throw new Error('invalid user');

    const uploadFolderName = 'userPhoto';

    const fileType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg', 'image/JPG'];
    const filterFiles = {
      user_photo: fileType,
      logo: fileType
    };

    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName, uniqueFileName: false });

    if (error) {
      throw new Error('Server error !');
    }
    const { username, password, role, domain, logo, copy_right_txt } = fields;
    const parseRole = JSON.parse(role);

    if (!parseRole.permission) throw new Error('provide all required informations');

    const hashPassword = await bcrypt.hash(password, Number(process.env.SALTROUNDS));

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
    const findUser = user.permissions.find((permission) => permission.value === parseRole.permission);
    if (!findUser) throw Error('Permission denied !');

    const targetUser = await prisma.user.findFirst({
      where: {
        id: parseInt(req.query.id)
      }
    });
    const data = { adminPanel: {} };
    if (username) data['username'] = username;
    if (password) data['password'] = hashPassword;

    // if (fetch_req_user_role?.title !== "SUPER_ADMIN" && domain && logo && copy_right_txt) throw new Error("permission denied for doamin/logo/copy_right fields")
    if (fetch_req_user_role?.title === 'SUPER_ADMIN') {
      const create_admin_panel = {
        upsert: {
          create: {
            domain: domain ?? undefined,
            copy_right_txt: copy_right_txt ?? undefined
          },
          update: {
            domain: domain ?? undefined,
            copy_right_txt: copy_right_txt ?? undefined
          }
        }
      };

      if (files?.logo?.newFilename) {
        create_admin_panel.upsert.create['logo'] = path.join(uploadFolderName, files.logo.newFilename);
        create_admin_panel.upsert.update['logo'] = path.join(uploadFolderName, files.logo.newFilename);
      }
      data['adminPanel'] = create_admin_panel;
    }

    if (files?.user_photo?.newFilename) {
      const user_imageNewName = Date.now().toString() + '_' + files.user_photo.originalFilename;
      await fspromises
        .rename(files.user_photo.filepath, path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, user_imageNewName))
        .then(() => {
          data['user_photo'] = path.join(uploadFolderName, user_imageNewName);
        })
        .catch((err) => {
          data['user_photo'] = path.join(uploadFolderName, files.user_photo?.newFilename);
        });

      if (targetUser?.user_photo) {
        const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, targetUser.user_photo);
        if (fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) console.log('user_photo deletion failed');
            else console.log('user_photo deleted');
          });
        }
      }
    }

    await prisma.user.update({
      where: {
        id: parseInt(req.query.id)
      },
      // @ts-ignore
      data
    });

    res.status(200).json({ message: `user updated Successfully` });
    // res.status(200).json({ data });
  } catch (err) {
    logFile.error(err.message);
    console.log(err.message);
    res.status(404).json({ error: err.message });
  }
};
