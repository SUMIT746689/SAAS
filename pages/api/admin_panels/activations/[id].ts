import patch from 'controllers/admin_panels/activation/patch';
import { logFile } from 'utilities_api/handleLogFile';

const id = async (req, res) => {
  // try {
  const { method } = req;

  switch (method) {
    case 'PATCH':
      patch(req, res);
      break;
    default:
      res.setHeader('Allow', ['PATCH']);
      logFile.error(`Method ${method} Not Allowed`)
      res.status(405).end(`Method ${method} Not Allowed`);
  } 
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json({ message: err.message });
  // }
};

export default id;
