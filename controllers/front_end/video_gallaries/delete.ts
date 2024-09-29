import prisma from '@/lib/prisma_client';
import { authenticate } from 'middleware/authenticate';
import { logFile } from 'utilities_api/handleLogFile';
async function delete_(req, res, refresh_token) {
    try {
        const {school_id} = refresh_token;
        const id = parseInt(req.query.id);
        if (Number.isNaN(id)) throw new Error('Provide invalid id ');

        const resWebsiteUi = await prisma.websiteUi.findFirst({
            where:{
                school_id
            },
            select:{
                video_gallery:true
            }
        })
        
        if(!resWebsiteUi) throw new Error('website ui not founds');

        const updatedVedioGallery =[] ;
        
        if(!Array.isArray(resWebsiteUi.video_gallery)) throw new Error("Nothing to update") 
        resWebsiteUi.video_gallery?.forEach(vg=> {
            if(vg.id !== id ) return updatedVedioGallery.push(vg);
        });


        await prisma.websiteUi.updateMany({
            where: {
                school_id
            },
            data: {
                video_gallery: updatedVedioGallery
            }
        });
        res.status(200).json({ success: 'Video Gallary deleted successfully!' });
    } catch (err) {
        logFile.error(err.message)
        res.status(404).json({ error: err.message });
    }
}
export default authenticate(delete_)


