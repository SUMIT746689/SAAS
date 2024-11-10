import get from 'controllers/students/downloads/get';
import { logFile } from 'utilities_api/handleLogFile';
const index = async (req, res) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      get(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET']);
      logFile.error(`Method ${method} Not Allowed`)
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default index;
