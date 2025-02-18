import { authenticate } from 'middleware/authenticate';
import prisma from '@/lib/prisma_client';
import { logFile } from 'utilities_api/handleLogFile';

const post = async (req, res, refresh_token) => {
  try {
    const { title, description, amount, type, resource_id, reference, resource_type } = req.body;
    await prisma.voucher.create({
      data: {
        title,
        description,
        amount,
        type,
        resource_id,
        resource_type,
        school_id: refresh_token.school_id,
        reference: reference || ''
      }
    })
    res.status(200).json({ message: 'New voucher created !' });
  } catch (err) {
    logFile.error(err.message)
    console.log({ err });
    res.status(404).json({ err: err.message });
  }
};
export default authenticate(post)


