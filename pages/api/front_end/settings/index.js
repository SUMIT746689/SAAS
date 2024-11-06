import get from 'controllers/front_end/settings/get';
import PUT from 'controllers/front_end/settings/put';
import { logFile } from 'utilities_api/handleLogFile';
const index = async (req, res) => {
  const { method } = req;
  switch (method) {
    case 'GET':
      get(req, res);
      break;
    case 'PUT':
      PUT(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      logFile.error(`Method ${method} Not Allowed`);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default index;
