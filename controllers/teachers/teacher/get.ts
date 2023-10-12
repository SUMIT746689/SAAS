import prisma from "@/lib/prisma_client";

export const post = async (req, res) => {
  const { id } = req.query;
  console.log({ id });
  await prisma.class.findFirst({
    where: { id: id},
    select: {
      name: true,
      code: true,
    }
  });
  res.status(200).json({ message: 'teacher created successfull!!' });
};
