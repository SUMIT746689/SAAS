import { authenticate } from 'middleware/authenticate';
import prisma from '@/lib/prisma_client';
import fs from 'fs';
import path from 'path';
import { logFile } from 'utilities_api/handleLogFile';


const delete_ = async (req: any, res: any, refresh_token) => {
    try {
        const { school_id } = refresh_token;
        const { id: id_, url } = req.query;

        const id = parseInt(id_);
        if (Number.isNaN(id)) throw new Error('provide valid id')

        const respWebsiteUi = await prisma.websiteUi.findFirst({ where: { id: id, school_id }, select: { gallery: true } });

        if (!Array.isArray(respWebsiteUi.gallery) || respWebsiteUi.gallery.length === 0) throw new Error("gallery is already empty");

        const findGalleryImageInfo: any = respWebsiteUi.gallery.find((gal: any) => gal.url === url);
        if (!findGalleryImageInfo) throw new Error('image not found');

        try {
            // image deleted
            const datas = path.join(process.cwd(), `${process.env.FILESFOLDER}`, findGalleryImageInfo.url);
            fs.unlinkSync(datas)
        }
        catch (err) { logFile.error(err) }
        const updateGallery = respWebsiteUi.gallery.filter((gal: any) => gal.url !== url)

        const updateGalleryWithRenamePathToUrl = updateGallery.map((gal: any) => {
            if (gal.path) return { ...gal, url: gal.path };
            return gal;
        })

        await prisma.websiteUi.update({
            where: { id: id },
            data: {
                gallery: updateGalleryWithRenamePathToUrl
            }
        })

        res.status(200).json({ success: 'deleted successfully' });

    } catch (err) {
        console.log(err.message);
        logFile.error(err.message);
        res.status(404).json({ err: err.message });
    }
};




export default authenticate(delete_);
