import { Button, Grid, TextField } from '@mui/material';

export const FileUploadFieldWrapper = ({ htmlFor, label, name, value, accept = "image", multiple = false, handleChangeFile, handleRemoveFile }) => {

    return (
        <Grid pb="1" mb={1}>
            <TextField
                id="outlined-basic"
                label={label}
                variant="outlined"
                size='small'

                name={name}
                value={value}
                sx={{
                    borderTopRightRadius: 1,
                    [`& fieldset`]: {
                        py: 1.85,
                        borderRadius: 0.8,
                        borderTopRightRadius: 0,
                        // borderTopLeftRadius:0.6,
                        // borderBottomRightRadius:0.6,
                        // borderBottomLeftRadius:0.6,
                        // fontSize: 0.2
                    },
                }}
                disabled
            />

            <label htmlFor={htmlFor}>
                <input
                    accept={`${accept}/*`}
                    style={{ display: 'none' }}
                    id={htmlFor}
                    multiple={multiple}
                    type="file"
                    onChange={handleChangeFile}
                />
                <Button variant='contained' component="span" sx={{ borderTopLeftRadius: 0, ml: 0.1, cursor: 'pointer' }}>
                    Upload
                </Button>
            </label>
            <Button onClick={handleRemoveFile} variant='contained' component="span" sx={{ borderTopLeftRadius: 0, ml: 0.1, bgcolor: 'gray', ":hover": { bgcolor: 'lightgrey' } }}>
                Remove
            </Button>
        </Grid>
    )
}