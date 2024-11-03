import get from 'controllers/class_wise/get';
import { logFile } from 'utilities_api/handleLogFile';
const index = async (req, res) => {
  // try {
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
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json({ message: err.message });
  // }
};
export default index;
