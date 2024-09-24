import { logFile } from 'utilities_api/handleLogFile';
// import post from '../../../../controllers/website/;
import get from '../../../../controllers/website/menu/get';
import post from 'controllers/website/video_gallaries/post';

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
