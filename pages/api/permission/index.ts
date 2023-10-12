import prisma from "@/lib/prisma_client";

const index = async (req, res) => {
    try {
        const { method } = req;

        switch (method) {
            // permission index
            case 'GET':
                const permission = await prisma.permission.findMany();
                res.status(200).json(permission);
                break;
            case 'POST':
            // permission creation
              await prisma.permission.create({
                    data: {
                        name: req.body.name,
                        value: req.body.value,
                        group: req.body.group,
                    }
                })
                    .then(() => res.status(200).json({ message: "permission created successfull!!" }))
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });

    }

}

export default index