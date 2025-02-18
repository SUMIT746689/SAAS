import get from "controllers/other_users/get";
import post from "controllers/other_users/post";
import { logFile } from "utilities_api/handleLogFile";
export const config = {
    api: {
        bodyParser: false,
    },
};
const index = async (req, res) => {
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
}

export default (index) 