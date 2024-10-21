export const handleFileChange = (e, setFieldValue, field, preview_field) => {
    console.log({ e: e?.target?.files, setFieldValue })

    if (e?.target?.files?.length === 0) {
        setFieldValue(field, '');
        setFieldValue(preview_field, []);
        return;
    }

    setFieldValue(field, e.target.files);

    const imgPrev:any = [];
    Array.prototype.forEach.call(e.target.files, (file) => {
        const objectUrl = URL.createObjectURL(file);
        imgPrev.push({ name: file.name, src: objectUrl })
    });
    setFieldValue(preview_field, imgPrev);
};

export const handleFileRemove = (setFieldValue, field, preview_field) => {
    setFieldValue(field, '');
    setFieldValue(preview_field, []);
}