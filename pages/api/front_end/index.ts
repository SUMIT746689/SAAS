import get from 'controllers/front_end/get';
import put from 'controllers/front_end/put';
import { logFile } from 'utilities_api/handleLogFile';

export const config = {
  api: {
    bodyParser: false
  }
};
const index = async (req, res) => {
  // try {
  const { method } = req;

  switch (method) {
    case 'GET':
      get(req, res);
      break;
    case 'PUT':
      put(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      logFile.error(`Method ${method} Not Allowed`);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json({ message: err.message });
  // }
};

export default index;
