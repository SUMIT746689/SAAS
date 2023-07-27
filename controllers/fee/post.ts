import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const prisma = new PrismaClient();

export default async function post(req, res, refresh_token) {
  try {
    const {
      title,
      amount,
      last_date,
      academic_year_id,
      class_id,
      school_id,
      late_fee,
    } = req.body;

    if (
      !title ||
      !amount ||
      !last_date ||
      !academic_year_id ||
      !class_id ||
      !school_id
    )
      throw new Error('provide all valid information');
    const data = {
      title,
      amount,
      last_date: new Date(last_date),
      // @ts-ignore
      academic_year_id,
      class_id,
      school_id
    };

    if (req.body.for) data['for'] = req.body.for;
    if (late_fee) data['late_fee'] = late_fee;
    const fee = await prisma.fee.create({
      // @ts-ignore
      data
    });
    await prisma.voucher.create({
      data: {
        title: `${data.title} exam fee`,
        description: data.title,
        amount: data.amount,
        reference: `${refresh_token.name}, ${refresh_token.role.title.toUpperCase()}`,
        type: 'credit',
        resource_type: 'fee',
        resource_id: fee.id

      }
    })

    res.status(200).json({ success: true, data: fee });
  } catch (err) {
    console.log(err.message);
    res.status(404).json({ err: err.message });
  }
}
