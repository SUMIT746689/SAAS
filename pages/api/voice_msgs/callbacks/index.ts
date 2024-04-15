import post from 'controllers/voice_msgs/callbacks/post';
import { logFile } from 'utilities_api/handleLogFile';


const index = async (req, res) => {
    const { method } = req;

    switch (method) {
        case 'POST':
            post(req, res);
            break;
        default:
            res.setHeader('Allow', ['POST']);
            logFile.error(`Method ${method} Not Allowed`)
            res.status(405).end(`Method ${method} Not Allowed`);
    }
};

export default index;
