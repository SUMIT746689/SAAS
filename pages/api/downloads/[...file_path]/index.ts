import fs from 'fs';
import path from 'path';
// import mime from 'mime' ;
import { logFile } from 'utilities_api/handleLogFile';
const index = async (req, res) => {
  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        const { file_path } = req.query;
        const updateFilePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, ...file_path);
        
        const filename = path.basename(updateFilePath);
        // var mimetype = mime.getType(file);
        res.setHeader('Content-disposition', 'attachment; filename=' + filename);
        // res.setHeader('Content-type', mimetype);
      
        if (!fs.existsSync(updateFilePath)) return res.json({ error: "no file found" });
        fs.createReadStream(updateFilePath).pipe(res);

        // fileReadSteam.on('data', (data) => {
        //   console.log(data);
        //   res.send(data)
        // })
        // res.on('end', () => res.end());
        break;
      default:
        res.setHeader('Allow', ['GET']);
        logFile.error(`Method ${method} Not Allowed`)
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.log(err);
    logFile.error(err.message)
    res.status(500).json({ message: err.message });
  }
};

export default index;
