import { PrismaClient } from '@prisma/client'

let prisma = new PrismaClient()

export default prisma

// for local environment
// import prisma from '../../../src/lib/prisma_client';

// export default prisma