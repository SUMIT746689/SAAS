import { logFile } from 'utilities_api/handleLogFile';
import post from '../../../../controllers/website/menu/post';
import get from '../../../../controllers/website/menu/get';

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
