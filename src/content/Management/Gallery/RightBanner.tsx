import { useState } from 'react';
import { Grid, Button, Card, } from '@mui/material';
import { NewFileUploadFieldWrapper, TextFieldWrapper } from '@/components/TextFields';
import { ButtonWrapper } from '@/components/ButtonWrapper';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';

function RightBanner({ banners, refetchBanner }: { banners: { url: string }[], refetchBanner: () => void }) {

    const [images, setImages] = useState([]);
    const [previewImages, setPreviewImages] = useState(undefined);
    const { showNotification } = useNotistick();
    const [redirectUrl, setRedirectUrl] = useState('');

    const handleSubmit = () => {

        const formData = new FormData();
        Array.prototype.forEach.call(images, (file) => {
            formData.append("banners", file);
        })
        formData.append("redirectUrl", redirectUrl);
        axios({
            method: 'POST',
            url: `/api/banners/right_banners`,
            data: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=<calculated when request is sent>`
            }
        })
            .then((res) => {
                console.log({ res })
                setImages(() => [])
                setPreviewImages(() => undefined)
                showNotification("right banners added successfully")
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

    const handleRemoveFromServer = (fileName) => {
        // console.log({ fileName })
        const formData = new FormData();
        // formData.append("file_name", fileName);

        axios({
            method: 'DELETE',
            url: `/api/banners/right_banners?image_name=${fileName}`,
            data: formData,
            headers: {
                'Content-Type': `multipart/form-data; boundary=<calculated when request is sent>`
            }
        })
            .then((res) => {
                console.log({ res })
                showNotification("right banners deleted successfully")
                refetchBanner();
            })
            .catch((error) => {
                console.log({ error })
            })
    }

    const handleRedirectUrlChange = (e) => {
        setRedirectUrl(e.target.value)
    }

    return (
        <>
            <Card sx={{ borderRadius: 0.5 }}>
                <Grid sx={{ borderRadious: 0, background:(themes)=>themes.colors.primary.dark, py: 1, color: "white", fontWeight: 700, textAlign: "center" }}>
                    Right Banner Images
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
                                {previewImages?.map((image, index) => (
                                    <>
                                        <PreviewImageCard data={image} index={index} key={index} handleRemove={handleRemove} />
                                        <TextFieldWrapper
                                            label="Redirect url"
                                            name="redirect url"
                                            value={redirectUrl}
                                            handleChange={handleRedirectUrlChange}
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
                        (Array.isArray(banners) && banners.length > 0) &&
                        banners?.map((banner, index) => (
                            <ImageCard url={banner.url} key={index} handleRemove={handleRemoveFromServer} />
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
                <img src={src} style={{ height: "100%", objectFit: "contain" }} />
            </Grid>
            <Grid sx={{ height: 20, fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                File name: <span style={{ color: "darkcyan" }}>{name}</span>
            </Grid>
            <Button onClick={() => handleRemove(index)} size='small' color="error" sx={{ borderRadius: 0.5, height: 30 }}>Remove</Button>
        </Grid>
    )
}

const ImageCard = ({ url, handleRemove }) => {
    return (
        <Card sx={{
            height: 180, width: 150, display: "flex", flexDirection: "column", justifyContent: "end", gridTemplateColumns: "auto",
            border: "1px solid lightgray", borderRadius: 0.5, boxShadow: "1px solid black", p: 0.5, ":hover": {
                scale: 1.5,
                cursor: "pointer"
            }
        }}
        >
            <Grid maxHeight={150} m={"auto"}>
                <img src={`/api/get_file/${url}`} style={{ height: "100%", objectFit: "contain" }} />
            </Grid>
            <Button onClick={() => handleRemove(url)} size='small' color="error" sx={{ borderRadius: 0.5, height: 30 }}>Remove</Button>
        </Card>
    )
}


export default RightBanner;
