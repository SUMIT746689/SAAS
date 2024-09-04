import { useState } from 'react';
import { Grid, Button, Card, Typography } from '@mui/material';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import { NewFileUploadFieldWrapper, TextFieldWrapper } from '@/components/TextFields';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import Image from 'next/image';

function LeftBanner({ id, galleries, refetchBanner }: {
    id: number,
    galleries: { id: string, english_content_name: string, originalFilename: string, bangla_content_name: string, url: string }[],
    refetchBanner: () => void
}) {

    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState(undefined);
    const [contentName, setContentName] = useState({ english_content_name: '', bangla_content_name: '' });
    const { showNotification } = useNotistick();

    const handleSubmit = () => {

        const formData = new FormData();
        Array.prototype.forEach.call(images, (file) => {
            formData.append("gallery_image", file);
        });
        formData.append("english_content_name", contentName.english_content_name);
        formData.append("bangla_content_name", contentName.bangla_content_name);

        axios({
            method: 'PUT',
            url: `/api/front_end/galleries`,
            data: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=<calculated when request is sent>`
            }
        })
            .then((res) => {
                setImages(() => [])
                setPreviewImages(() => undefined)
                showNotification("galleries added successfully")
                refetchBanner();
            })
            .catch((error) => {
                console.log({ error })
            })
    }

    const handleFileChange = (e) => {
        if (e?.target?.files?.length === 0) {
            setImages(() => []);
            setPreviewImages(() => []);
            return;
        }
        setImages(() => e.target.files);
        const imgPrev = [];
        Array.prototype.forEach.call(e.target.files, (file) => {
            const objectUrl = URL.createObjectURL(file);
            imgPrev.push({ name: file.name, src: objectUrl })
            // console.log({ objectUrl });
            // console.log({ file: file.name })
        });
        setPreviewImages(() => imgPrev)
    }

    const handleRemove = (index) => {
        setPreviewImages((images) => {
            const imagesFilter = images.filter((image, imgIndex) => imgIndex !== index);
            return imagesFilter;
        })
    }

    const handleRemoveFromServer = (url) => {
        // console.log({ fileName })
        const formData = new FormData();
        // formData.append("file_name", fileName);

        axios({
            method: 'DELETE',
            url: `/api/front_end/galleries?id=${id}&url=${url}`,
            data: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=<calculated when request is sent>`
            }
        })
            .then((res) => {
                showNotification("galleries deleted successfully")
                refetchBanner();
            })
            .catch((error) => {
                console.log({ error })
            })
    }

    const handleContentNameChange = (e) => {
        setContentName((v) => ({ ...v, [e.target.name]: e.target.value }))
    }

    return (
        <>
            <Card sx={{ borderRadius: 0.5 }}>
                <Grid sx={{ borderRadious: 0, background: (themes) => themes.colors.primary.dark, py: 1, color: "white", fontWeight: 700, textAlign: "center" }}>
                    Gallery Images
                </Grid>
                <Grid m={1} mt={2}>
                    <NewFileUploadFieldWrapper
                        htmlFor="left_images"
                        // name="left_images"
                        // multiple={true}
                        accept="image"
                        handleChangeFile={handleFileChange}
                    />
                    <Grid display="flex" justifyContent="center" flexWrap="wrap" gap={1} my={1}>
                        {
                            (Array.isArray(previewImages) && previewImages.length > 0) &&
                            <>
                                <Grid width="100%" fontWeight={600}>Preview:</Grid>
                                {
                                    previewImages?.map((image, index) => (
                                        <>
                                            <PreviewImageCard data={image} index={index} key={index} handleRemove={handleRemove} />
                                            <TextFieldWrapper
                                                label="Content Name (English)"
                                                name="english_content_name"
                                                value={contentName.english_content_name}
                                                handleChange={handleContentNameChange}
                                                handleBlur={undefined}
                                                errors={undefined}
                                                touched={undefined}
                                            />
                                            <TextFieldWrapper
                                                label="Content Name (Bangla)"
                                                name="bangla_content_name"
                                                value={contentName.bangla_content_name}
                                                handleChange={handleContentNameChange}
                                                handleBlur={undefined}
                                                errors={undefined}
                                                touched={undefined}
                                            />
                                        </>
                                    ))
                                }
                            </>
                        }
                    </Grid>

                    <ButtonWrapper disabled={!previewImages || previewImages?.length === 0} handleClick={handleSubmit}> + ADD</ButtonWrapper>

                </Grid>

                <Grid className=' flex flex-wrap gap-1 justify-center pb-3'>
                    {
                        (Array.isArray(galleries) && galleries.length > 0) &&
                        galleries?.map((data, index) => (
                            <ImageCard data={data} url={data.url} key={index} handleRemove={handleRemoveFromServer} />
                        ))

                    }
                </Grid>
            </Card>
        </>
    );
}

const PreviewImageCard = ({ data, index, handleRemove }) => {
    const { src, name } = data;
    return (
        <Grid height={180} width={150} display="flex" flexDirection="column" justifyContent="end" gridTemplateColumns={"auto"}
            sx={{
                border: "1px solid skyblue", borderRadius: 0.6, borderStyle: "dashed", p: 0.5, ":hover": {
                    scale: 1.5,
                    cursor: "pointer"
                }
            }}
        >
            <Grid maxHeight={140} m={"auto"}>
                <Image src={src} alt="preview image" width={140} height={140} style={{ height: "100%", objectFit: "contain" }} />
            </Grid>
            <Grid sx={{ height: 20, fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                File name: <span style={{ color: "darkcyan" }}>{name}</span>
            </Grid>
            <Button onClick={() => handleRemove(index)} size='small' color="error" sx={{ borderRadius: 0.5, height: 30 }}>Remove</Button>
        </Grid>
    )
}

const ImageCard = ({ data, url, handleRemove }) => {
    const { english_content_name, bangla_content_name } = data;
    return (
        <Card sx={{
            height: 250, width: 200, display: "flex", flexDirection: "column", justifyContent: "end", gridTemplateColumns: "auto",
            border: "1px solid lightgray", borderRadius: 0.5, boxShadow: "1px solid black", p: 0.5, ":hover": {
                scale: 1.5,
                cursor: "pointer"
            }
        }}
        >
            <Grid maxHeight={170} m={"auto"}>
                <Image src={`/api/get_file/${url}`} alt="image" width={200} height={170} style={{ height: "100%", objectFit: "contain" }} />
            </Grid>
            <Typography sx={{ fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: (theme) => theme.colors.primary.dark }}>Name (eng): {english_content_name}</Typography>
            <Typography sx={{ fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: (theme) => theme.colors.info.dark }}>Name (ban): {bangla_content_name}</Typography>
            <Button onClick={() => handleRemove(url)} size='small' color="error" sx={{ borderRadius: 0.5, height: 30 }}>Remove</Button>
        </Card>
    )
}

export default LeftBanner;
