import { logFile } from "utilities_api/handleLogFile";
import patch from 'controllers/front_end/website_dynamic_pages/patch';
import delete_ from 'controllers/front_end/website_dynamic_pages/delete';

export const config = {
    api: {
      bodyParser: false,
    },
  };  

const id = async (req, res) => {
    try {
        const { method } = req;
        const id = parseInt(req.query.id);
        if (Number.isNaN(id)) throw new Error('Provide invalid id ');

        switch (method) {
            case 'PATCH':
                patch(req, res);
                break;

            case 'DELETE':
                delete_(req, res)
                break;

            default:
                res.setHeader('Allow', ['PATCH', 'DELETE']);
                logFile.error(`Method ${method} Not Allowed`);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (err) {
        console.log(err);
        logFile.error(err.message);
        res.status(500).json({ message: err.message });
    }
};

export default id;
