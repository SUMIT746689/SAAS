import type { NextApiRequest, NextApiResponse } from 'next/types';
import { PrismaClient } from '@prisma/client';
import get from 'controllers/subscriptions/get';
import post from 'controllers/subscriptions/post';
import { logFile } from 'utilities_api/handleLogFile';

const prisma = new PrismaClient();

const index = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case 'GET':
      get(req, res);
      break;

    case 'POST':
      post(req, res);
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      logFile.error(`Method ${method} Not Allowed`)
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default index;
