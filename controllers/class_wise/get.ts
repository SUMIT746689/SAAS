import prisma from '@/lib/prisma_client';
import { parse } from 'path';
import { logFile } from 'utilities_api/handleLogFile';

export default async function get(req: any, res: any) {
  const { class_id } = req.query;
  try {
    console.log({class_id});
    const classWiseFee = await prisma.fee.findMany({
      where:{
        class_id: parseInt(class_id)
      },
      select: { 
        fees_head: true,
        amount: true,
        fees_month: true,
        late_fee: true,

       }
    });
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // replace this your actual origin
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,DELETE,PATCH,POST,PUT'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    res.status(200).json({ data: classWiseFee, success: true });
    console.log({classWiseFee})
  } catch (err) {
    logFile.error(err.message);
    res.status(404).json({ err: err.message });
  }
}
