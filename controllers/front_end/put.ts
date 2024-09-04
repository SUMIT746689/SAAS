import { authenticate } from 'middleware/authenticate';
import path from 'path';
import { fileUpload } from '@/utils/upload';
import prisma from '@/lib/prisma_client';
import fs from 'fs';
import fsP from "fs/promises";
import { logFile } from 'utilities_api/handleLogFile';

async function put(req, res, refresh_token) {
    const uploadFolderName = "frontendPhoto";

    const fileType = ['image/jpeg', 'image/jpg', 'image/png'];
    const filterFiles = {
        carousel_image: fileType,
        header_image: fileType,
        chairman_photo: fileType,
        principal_photo: fileType,
        assist_principal_photo: fileType
    }

    const { files, fields, error } = await fileUpload({ req, filterFiles, uploadFolderName, uniqueFileName: false });

    const allFiles = []
    try {

        if (error) {
            throw new Error('image upload failed !')
        }

        const websiteUirow = await prisma.websiteUi.findFirst({
            where: {
                school_id: refresh_token?.school_id
            }
        })

        const query: any = {};

        if (files?.header_image?.newFilename) {

            const header_imageNewName = Date.now().toString() + '_' + files.header_image.originalFilename;

            await fsP.rename(files.header_image.filepath, path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, header_imageNewName))
                .then(() => {
                    const temp = path.join(uploadFolderName, header_imageNewName)
                    allFiles.push(temp)
                    query['header_image'] = temp

                })
                .catch(err => {
                    console.log("error____", err);
                    const temp = path.join(uploadFolderName, files.header_image?.newFilename)
                    allFiles.push(temp)
                    query['header_image'] = temp
                })
            if (websiteUirow?.header_image) {
                const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, websiteUirow.header_image);
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.log('photo deletion failed');
                        else console.log("photo deleted");
                    })
                }
            }

        }
        if (files.about_school_photo?.newFilename) {
            const photoNewName = Date.now().toString() + '_' + files.about_school_photo.originalFilename;
            await fsP.rename(files.about_school_photo.filepath, path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, photoNewName))
                .then(() => {
                    const temp = path.join(uploadFolderName, photoNewName)
                    allFiles.push(temp)
                    query['about_school_photo'] = temp

                })
                .catch(err => {
                    console.log("err__", err);
                    const temp = path.join(uploadFolderName, files.about_school_photo?.newFilename)
                    allFiles.push(temp)
                    query['about_school_photo'] = temp
                })

            if (websiteUirow?.about_school_photo) {
                const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, websiteUirow.about_school_photo);
                if (fs.existsSync(filePath)) {
                    console.log("about_school_photo");
                    fs.unlink(filePath, (err) => {
                        if (err) console.log('photo deletion failed');
                        else console.log("photo deleted");
                    })
                }
            }

        }
        if (files.chairman_photo?.newFilename) {
            const chairman_photoNewName = Date.now().toString() + '_' + files.chairman_photo.originalFilename;

            await fsP.rename(files.chairman_photo.filepath, path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, chairman_photoNewName))
                .then(() => {
                    const temp = path.join(uploadFolderName, chairman_photoNewName)
                    allFiles.push(temp)
                    query['chairman_photo'] = temp

                })
                .catch(err => {
                    console.log("err__", err);
                    const temp = path.join(uploadFolderName, files.chairman_photo?.newFilename)
                    allFiles.push(temp)
                    query['chairman_photo'] = temp
                })
            if (websiteUirow?.chairman_photo) {
                const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, websiteUirow.chairman_photo);
                if (fs.existsSync(filePath)) {
                    console.log("chairman_photo");
                    fs.unlink(filePath, (err) => {
                        if (err) console.log('photo deletion failed');
                        else console.log("photo deleted");
                    })

                }
            }
        }
        if (files.principal_photo?.newFilename) {
            const principal_photoNewName = Date.now().toString() + '_' + files.principal_photo.originalFilename;

            await fsP.rename(files.principal_photo.filepath, path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, principal_photoNewName))
                .then(() => {
                    const temp = path.join(uploadFolderName, principal_photoNewName)
                    allFiles.push(temp)
                    query['principal_photo'] = temp

                })
                .catch(err => {
                    console.log("err__", err);
                    const temp = path.join(uploadFolderName, files.principal_photo?.newFilename)
                    allFiles.push(temp)
                    query['principal_photo'] = temp
                })
            if (websiteUirow?.principal_photo) {
                const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, websiteUirow.principal_photo);
                if (fs.existsSync(filePath)) {
                    console.log("principal_photo");
                    fs.unlink(filePath, (err) => {
                        if (err) console.log('photo deletion failed');
                        else console.log("photo deleted");
                    })
                }
            }
        }
        if (files.assist_principal_photo?.newFilename) {
            const photoNewName = Date.now().toString() + '_' + files.assist_principal_photo.originalFilename;

            await fsP.rename(files.assist_principal_photo.filepath, path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, photoNewName))
                .then(() => {
                    const temp = path.join(uploadFolderName, photoNewName)
                    allFiles.push(temp)
                    query['assist_principal_photo'] = temp

                })
                .catch(err => {
                    console.log("err__", err);
                    const temp = path.join(uploadFolderName, files.assist_principal_photo?.newFilename)
                    allFiles.push(temp)
                    query['assist_principal_photo'] = temp
                })
            if (websiteUirow?.assist_principal_photo) {
                const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, websiteUirow.assist_principal_photo);
                if (fs.existsSync(filePath)) {
                    console.log("assist_principal_photo");
                    fs.unlink(filePath, (err) => {
                        if (err) console.log('photo deletion failed');
                        else console.log("photo deleted");
                    })
                }
            }
        }
        let flag = false;

        if (files.carousel_image) {
            const carousel_imageList = []
            let index = 0;

            const tempCarousel = Array.isArray(files.carousel_image) ? files.carousel_image : [files.carousel_image]

            for (const i of tempCarousel) {
                const newName = Date.now().toString() + '_' + i.originalFilename

                const newFilePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, newName);

                await fsP.rename(i.filepath, newFilePath)
                    .then(() => {
                        const temp = path.join(uploadFolderName, newName)
                        allFiles.push(temp)
                        carousel_imageList.push({
                            number: index,
                            originalFilename: i.originalFilename,
                            path: temp
                        })

                    })
                    .catch(err => {
                        const temp = path.join(uploadFolderName, i.newFilename)
                        allFiles.push(temp)
                        carousel_imageList.push({
                            number: index,
                            originalFilename: i.originalFilename,
                            path: temp
                        })

                    })

                if (websiteUirow?.carousel_image && !flag) {
                    // @ts-ignore 
                    for (const l of websiteUirow.carousel_image) {
                        console.log("ttttttttttttt");
                        if (l?.path) {
                            const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, l?.path);
                            console.log("filePath__", filePath);

                            if (fs.existsSync(filePath)) {
                                console.log(`${l.number}`);

                                fs.unlink(filePath, (err) => {
                                    if (err) console.log('photo deletion failed');
                                    else console.log("photo deleted");
                                })
                            }
                        }
                    }
                    flag = true;
                }
                index++;
            }
            query['carousel_image'] = carousel_imageList
        }
        if (files.gallery) {
            const gallery_imageList = []
            let index = 0;

            const tempCarousel = Array.isArray(files.gallery) ? files.gallery : [files.gallery]

            for (const i of tempCarousel) {
                const newName = Date.now().toString() + '_' + i.originalFilename

                const newFilePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, uploadFolderName, newName);

                await fsP.rename(i.filepath, newFilePath)
                    .then(() => {
                        const filePath = path.join(uploadFolderName, newName)
                        allFiles.push(filePath)
                        gallery_imageList.push({
                            number: index,
                            originalFilename: i.originalFilename,
                            path: filePath
                        })

                    })
                    .catch(err => {
                        const filePath = path.join(uploadFolderName, i.newFilename)
                        allFiles.push(filePath)
                        gallery_imageList.push({
                            number: index,
                            originalFilename: i.originalFilename,
                            path: filePath
                        })

                    })

                if (websiteUirow?.gallery && !flag) {
                    // @ts-ignore 
                    for (const l of websiteUirow.gallery) {
                        if (l?.path) {
                            const filePath = path.join(process.cwd(), `${process.env.FILESFOLDER}`, l?.path);
                            console.log("filePath__", filePath);

                            if (fs.existsSync(filePath)) {
                                console.log(`${l.number}`);

                                fs.unlink(filePath, (err) => {
                                    if (err) console.log('photo deletion failed');
                                    else console.log("photo deleted");
                                })
                            }
                        }
                    }
                    flag = true;
                }
                index++;
            }
            query['gallery'] = gallery_imageList
        }
        // if (fields?.school_history) {
        //     query['school_history'] = fields?.school_history
        // }
        // if (fields?.chairman_speech) {
        //     query['chairman_speech'] = fields?.chairman_speech
        // }
        // if (fields?.principal_speech) {
        //     query['principal_speech'] = fields?.principal_speech
        // }
        if (fields?.eiin_number) {
            query['eiin_number'] = fields?.eiin_number
        }
        if (fields?.facebook_link) {
            query['facebook_link'] = fields?.facebook_link
        }
        if (fields?.twitter_link) {
            query['twitter_link'] = fields?.twitter_link
        }
        if (fields?.google_link) {
            query['google_link'] = fields?.google_link
        }
        if (fields?.linkedin_link) {
            query['linkedin_link'] = fields?.linkedin_link
        }
        if (fields?.youtube_link) {
            query['youtube_link'] = fields?.youtube_link
        }
        if (fields?.e_books_section) {
            query['e_books_section'] = JSON.parse(fields?.e_books_section)
        }
        if (fields?.downloads_section) {
            query['downloads_section'] = JSON.parse(fields?.downloads_section)
        }

        if (fields?.english_about_school_desc) query['english_about_school_desc'] = fields.english_about_school_desc
        if (fields?.bangla_about_school_desc) query['bangla_about_school_desc'] = fields.bangla_about_school_desc

        if (fields?.english_chairman_name) query['english_chairman_name'] = fields.english_chairman_name
        if (fields?.bangla_chairman_name) query['bangla_chairman_name'] = fields.bangla_chairman_name

        if (fields?.english_principal_name) query['english_principal_name'] = fields.english_principal_name
        if (fields?.bangla_principal_name) query['bangla_principal_name'] = fields.bangla_principal_name

        if (fields?.english_assist_principal_name) query['english_assist_principal_name'] = fields.english_assist_principal_name
        if (fields?.bangla_assist_principal_name) query['bangla_assist_principal_name'] = fields.bangla_assist_principal_name

        if (fields?.english_chairman_speech) query['english_chairman_speech'] = fields.english_chairman_speech
        if (fields?.bangla_chairman_speech) query['bangla_chairman_speech'] = fields.bangla_chairman_speech

        if (fields?.english_principal_speech) query['english_principal_speech'] = fields.english_principal_speech
        if (fields?.bangla_principal_speech) query['bangla_principal_speech'] = fields.bangla_principal_speech

        if (fields?.english_assist_principal_speech) query['english_assist_principal_speech'] = fields.english_assist_principal_speech
        if (fields?.bangla_assist_principal_speech) query['bangla_assist_principal_speech'] = fields.bangla_assist_principal_speech


        if (websiteUirow) {
            await prisma.websiteUi.update({
                where: {
                    id: websiteUirow.id
                },
                data: query
            });
        }
        else {
            const tempData = {
                header_image: query?.header_image || undefined,
                carousel_image: Array.isArray(query?.carousel_image) ? query?.carousel_image : [],
                // school_history: query?.school_history || '',
                // history_photo: query?.history_photo || '*',
                // history_description: '',
                about_school_photo: query?.about_school_photo || undefined,
                bangla_about_school_desc: query?.bangla_about_school_desc || undefined,
                english_about_school_desc: query?.english_about_school_desc || undefined,

                english_chairman_name: query?.english_chairman_name || undefined,
                bangla_chairman_name: query?.bangla_chairman_name || undefined,
                chairman_photo: query?.chairman_photo || undefined,
                english_chairman_speech: query?.english_chairman_speech || undefined,
                bangla_chairman_speech: query?.bangla_chairman_speech || undefined,

                english_principal_name: query?.english_principal_name || undefined,
                bangla_principal_name: query?.bangla_principal_name || undefined,
                principal_photo: query?.principal_photo || undefined,
                english_principal_speech: query?.english_principal_speech || undefined,
                bangla_principal_speech: query?.bangla_principal_speech || undefined,

                english_assist_principal_name: query?.english_assist_principal_name || undefined,
                bangla_assist_principal_name: query?.bangla_assist_principal_name || undefined,
                assist_principal_photo: query?.assist_principal_photo || undefined,
                english_assist_principal_speech: query?.english_assist_principal_speech || undefined,
                bangla_assist_principal_speech: query?.bangla_assist_principal_speech || undefined,

                eiin_number: query?.eiin_number || '',
                facebook_link: query?.facebook_link || '',
                youtube_link: query?.youtube_link || '',
                twitter_link: query?.twitter_link || '',
                google_link: query?.google_link || '',
                linkedin_link: query?.linkedin_link || '',
                gallery: Array.isArray(query?.gallery) ? query?.gallery : [],
                school: {
                    connect: {
                        id: refresh_token?.school_id
                    }
                },
            }
            console.log({ tempData });

            await prisma.websiteUi.create({
                data: tempData
            })
        }

        res.status(200).json({ message: 'Frontend information updated !' });
    } catch (error) {
        console.log("error__", error);
        for (const i of allFiles) {
            const filePath = path.join(process.cwd(), i)
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
        }
        logFile.error(error.message)
        res.status(404).json({ Error: error.message });
    }
}
export default authenticate(put);