import get from 'controllers/exam_terms/exam_term/get';
import patch from 'controllers/exam_terms/exam_term/patch';
import delete_ from 'controllers/exam_terms/exam_term/delete_';
import { logFile } from 'utilities_api/handleLogFile';


const index = async (req, res) => {
  // try {
    const { method } = req;

    switch (method) {
      case 'GET':
        get(req, res);
        break;
      case 'PATCH':
        patch(req, res);
        break;
      case 'DELETE':
        delete_(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET','PATCH','DELETE']);
        logFile.error(`Method ${method} Not Allowed`);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json({ message: err.message });
  // }
};

export default index;
