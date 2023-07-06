import get from 'controllers/sms_gateways/get';
import post from 'controllers/sms_gateways/post';


const index = async (req, res) => {
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
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default index;
