import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';

const patchSchoolBranch = async (req, res, authenticate_user) => {
  try {
    const { school_id, admin_panel_id } = authenticate_user;
    const { id } = req.query;

    const authenticate_user_Info = await prisma.user.findFirst({
      where: { id: authenticate_user.id, school_id },
      select: {
        role: true,
        school: true
      }
    });

    if (authenticate_user_Info.role.title !== 'ADMIN') throw new Error('Your role have no permissions');

    const {
      name, phone, optional_phone, map_location, email, address, admin_ids, currency, domain,
    } = req.body;

    const admins = admin_ids.map((id) => ({ id }));
    
    const response = await prisma.school.update({
      where: {
        id: parseInt(id),
        parent_school_id: school_id
      },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        optional_phone:  optional_phone || undefined, 
        map_location:  map_location || undefined,
        email: email || undefined,
        address: address || undefined,
        currency: currency || undefined,
        domain: domain || undefined,
        admins: { connect: admins }
      }
    });

    if (!response) throw new Error('Failed to create school');
    res.status(200).json({ success: true, message: 'Successfully created school' });

  } catch (err) {
    logFile.error(err.message)
    if (err.message.includes(`schools_domain_key`)) return res.status(404).json({ error: 'This domain is already used, use another' });

    console.log(err.message);
    res.status(404).json({ error: err.message });
  }
};

export default authenticate(patchSchoolBranch);
