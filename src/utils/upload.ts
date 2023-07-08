import formidable from "formidable";
import path from "path";
import fs from "fs/promises";

export const saveImage = (req, saveLocally) => {

    const options: formidable.Options = {};

    if (saveLocally) {

        options.uploadDir = path.join(process.cwd(), "/public/files");

        options.filename = (name, ext, path, form) => {
            return Date.now().toString() + "_" + path.originalFilename;
        };
        // options.filter = ({name, originalFilename, mimetype})=>{

        // }
    }
    // options.maxFileSize = 4000 * 1024 * 1024;
    const form = formidable(options);

    return new Promise((resolve, reject) => {

        form.parse(req, (err, fields, files) => {
            console.log({ files })
            if (err) reject(err);
            resolve({ fields, files });
        });
    });
};
export const imageFolder = async () => {
    try {
        await fs.readdir(path.join(process.cwd() + "/public", "/files"));
    } catch (error) {
        await fs.mkdir(path.join(process.cwd() + "/public", "/files"));
    }
}
export const certificateTemplateFolder = async (foldername: string) => {
    try {
        // await fs.readdir(path.join(process.cwd() + "/public", `/${foldername}`));
        await fs.readdir(path.join(process.cwd(), `/${foldername}`));
    } catch (error) {
        // await fs.mkdir(path.join(process.cwd() + "/public", `/${foldername}`));
        await fs.mkdir(path.join(process.cwd(), `/${foldername}`));
    }
}

export const validateField = async (req) => {

    const options: formidable.Options = {};
    const form = formidable(options);

    return await new Promise(async (resolve, reject) => {

        try {
            await form.parse(req, (err, fields, files) => {
                // console.log("request validation__", fields.first_name);
                console.log({ fields, files })
                if (err) {
                    console.log("1")
                    reject(err);
                }
                else if (!fields.first_name) {
                    console.log("2")
                    reject({ message: 'first_name required' });
                }
                else {
                    console.log("3")
                    resolve("dd")
                    // resolve({ message: "ok" });
                }
                console.log("sdf")
                resolve("")
            });


        } catch (error) {
            console.log(error)
            reject()
        }


    });


}

// export const fileUpload = async ({ req, filterFiles, uploadFolderName, uniqueFileName = true }) => {
//     let error = null;

//     const options: formidable.Options = {};
//     options.uploadDir = path.join(process.cwd(), `${uploadFolderName}`);
//     // options.multiple = true;
//     // options.maxFieldsSize = 1 * 1024 * 1024;
//     options.keepExtensions = true;
//     options.filename = (name, ext, path, form) => uniqueFileName ? Date.now().toString() + '_' + path.originalFilename : path.originalFilename;
//     options['filter'] = function ({ name, mimetype }) {

//         for (const [key, value] of Object.entries(filterFiles)) {
//             if (name === key)
//                 // @ts-ignore
//                 if (!value.includes(mimetype)) {
//                     error = `Only png, jpg & jpeg is supported for ${key}`
//                     return false;
//                 }
//         }
//         return true;
//     };

//     const form = await formidable(options);


//     const [files, fields] = await new Promise((resolve) => {

//         form.parse(req, (err, fields, files) => {
//             if (err) {
//                 error = err;
//                 resolve([{}, {}]);
//             }
//             else {

//                 console.log("fields__", typeof (fields.carousel_image_name_list), fields.carousel_image_name_list);

//                 const convertJsonfile = JSON.stringify(files);
//                 console.log("convertJsonfile__", typeof (JSON.stringify(fields)), JSON.stringify(fields));

//                 const convertObjectfile = JSON.parse(convertJsonfile);
//                 console.log("convertJsonfile__", typeof (convertObjectfile), convertObjectfile);
//                 resolve([convertObjectfile, fields]);
//             }
//         });
//     });
//     return { files, fields, error };
// }

export const fileUpload = async ({ req, filterFiles, uploadFolderName, uniqueFileName = true }) => {

    let error = null;

    const uploadDir = path.join(process.cwd(), `${uploadFolderName}`);

    const customOptions = {
        keepExtensions: true,
        allowEmptyFiles: false,
        maxFileSize: 5 * 1024 * 1024 * 1024,
        multiples: true,
        uploadDir: uploadDir,
        filter: function ({ name, mimetype }) {

            for (const [key, value] of Object.entries(filterFiles)) {
                if (name === key) {
                    // @ts-ignore
                    const type = value.map(element => element.slice(6)).join(', ');
                    // @ts-ignore
                    if (!value.includes(mimetype)) {
                        error = `Only ${type} format is supported for ${key}`
                        return false;
                    }
                }
            }
            return true;
        }
    };

    const form = new formidable.IncomingForm(customOptions)

    // const fls = [];
    // const flds = [];

    form
        //     .on('field', function (field, value) {
        //         // console.log(field, value);
        //         flds.push([field, value]);
        //     })
        .on('file', function (field, file) {
            const filename = path.join(process.cwd(), uploadFolderName, Date.now().toString() + '_' + file.originalFilename);
            // console.log({ field, file });
            fs.rename(file.filepath, filename)
            // fls.push([field, file]);
        })
    // .on('end', function () {
    //     console.log({ fls, flds });
    //     console.log('-> upload done');
    // });

    // @ts-ignore
    const [files, fields] = await new Promise((resolve) => {

        form.parse(req, (err, fields, files) => {
            if (err) {
                error = err;
                resolve([{}, {}]);
            }
            else {
                console.log("fields__", typeof (fields.carousel_image_name_list), fields.carousel_image_name_list);

                const convertJsonfile = JSON.stringify(files);
                console.log("convertJsonfile__", typeof (JSON.stringify(fields)), JSON.stringify(fields));

                const convertObjectfile = JSON.parse(convertJsonfile);
                console.log("convertJsonfile__", typeof (convertObjectfile), convertObjectfile);
                resolve([convertObjectfile, fields]);
            }
        });
    });
    return { files, fields, error };
}