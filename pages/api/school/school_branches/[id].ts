import delete_ from 'controllers/schools/school_branches/school_branch/delete';
import getSchool from 'controllers/schools/single-school/get-school';
import patch from 'controllers/schools/school_branches/school_branch/patch';
import { logFile } from 'utilities_api/handleLogFile';

const id = async (req, res) => {
  // try {
  const { method } = req;
  // const id = parseInt(req.query.id);
  switch (method) {
    // case 'GET':
    //   getSchool(req, res, refresh_token);
    //   break;
    case 'DELETE':
      delete_(req, res);
      break;
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
