import { PrismaClient } from '@prisma/client'

let prisma = new PrismaClient()
  // console.log({prisma});
    prisma.$on('error', (e) => console.log(e));
    prisma.$on('query', (e) => console.log(e));
    // const psm = async () => {
    // prisma.$on("exit",()=>{
    //   console.log("hi..................")
    // })
    // prisma.on('beforeExit', async () => {
    //   console.log('beforeExit hook')
    // })
  // }
  // psm();

export default prisma