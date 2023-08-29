// import deleteRoute from '../../../controllers/fee/deleteRoute';
import { authenticate } from 'middleware/authenticate';
import get from '../../../controllers/fee/get';
import post from '../../../controllers/fee/post';

const userHandler = (req, res, refresh_token) => {
  const { method } = req;

  switch (method) {
    case 'GET':
      get(req, res, refresh_token);
      break;
    case 'POST':
      post(req, res, refresh_token);
      break;
    // case 'DELETE':
    // deleteRoute(req, res);
    // break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
export default authenticate(userHandler)