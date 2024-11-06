import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';
async function put(req, res, refresh_token) {
  try {
    const { school_id } = refresh_token;
    const { is_branch_wise_fees_collection, branch_wise_addmission } = req.body;
    console.log({ is_branch_wise_fees_collection}, {branch_wise_addmission})
    await prisma.websiteUi.update({
      where: {
        id: school_id
    },
      data: {
        is_branch_wise_fees_collection: typeof is_branch_wise_fees_collection === "boolean" ? is_branch_wise_fees_collection : undefined,
        branch_wise_addmission: typeof branch_wise_addmission === "boolean" ? branch_wise_addmission : undefined,
      }
  });
  return res.status(200).json({ message: "updated sucessfully" })

  } catch (error) {
    logFile.error(error.message);
    res.status(404).json({ Error: error.message });
  }
}
export default authenticate(put)