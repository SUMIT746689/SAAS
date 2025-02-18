import { logFile } from 'utilities_api/handleLogFile';
import post from '../../../../controllers/website/quick_links/post';
import get from '../../../../controllers/website/quick_links/get';

const userHandler = (req, res) => {
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
      logFile.error(`Method ${method} Not Allowed`);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};
export default userHandler;
