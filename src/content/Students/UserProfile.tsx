import { getFile } from "@/utils/utilitY-functions";
import { Card, Dialog, Grid, Typography } from "@mui/material";
import dayjs from "dayjs";
import Image from "next/image";


const girl_photo = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjU2IDI1NiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8bWV0YWRhdGE+IFN2ZyBWZWN0b3IgSWNvbnMgOiBodHRwOi8vd3d3Lm9ubGluZXdlYmZvbnRzLmNvbS9pY29uIDwvbWV0YWRhdGE+DQo8Zz48Zz48cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSJNMTYyLjgsMTI3LjZjLTguNywxMi4xLTIxLjEsMTkuNi0zNC44LDE5LjZjLTEzLjcsMC0yNi4xLTcuNS0zNC43LTE5LjRsLTI1LjEtMC4zbDAuNi00MS45QzY5LDQzLjgsOTUuNCwxMCwxMjgsMTBjMzIuNiwwLDU5LDMzLjgsNTkuMyw3NS42bDAuNiw0MS43TDE2Mi44LDEyNy42TDE2Mi44LDEyNy42eiBNMTU4LjYsNTEuM2MtMjQuMyw2LjQtMjQuNCwzMC4xLTcxLjIsMjguMkM4Ny4yLDgxLjcsODcsODQsODcsODYuM2MwLDI5LjEsMTguMyw1Mi43LDQxLDUyLjdjMjIuNiwwLDQxLTIzLjYsNDEtNTIuN0MxNjksNzIuOCwxNjUsNjAuNiwxNTguNiw1MS4zTDE1OC42LDUxLjN6IE0xNzUuMiwxMzYuOWMtMTEuNSwxNS45LTI4LjQsMjUuOS00Ny4yLDI1LjljLTE4LjgsMC0zNS43LTEwLTQ3LjItMjUuOUM1My40LDE1OCwzNS4xLDE5Ni44LDM1LjEsMjQxLjJjMCwxLjYsMCwzLjIsMC4xLDQuOGgxODUuN2MwLTEuNiwwLjEtMy4yLDAuMS00LjhDMjIwLjksMTk2LjgsMjAyLjYsMTU4LDE3NS4yLDEzNi45eiIvPjwvZz48L2c+DQo8L3N2Zz4="
const boy_photo = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gU3ZnIFZlY3RvciBJY29ucyA6IGh0dHA6Ly93d3cub25saW5ld2ViZm9udHMuY29tL2ljb24gLS0+DQo8IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPg0KPHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjU2IDI1NiIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjU2IDI1NiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+DQo8bWV0YWRhdGE+IFN2ZyBWZWN0b3IgSWNvbnMgOiBodHRwOi8vd3d3Lm9ubGluZXdlYmZvbnRzLmNvbS9pY29uIDwvbWV0YWRhdGE+DQo8Zz48Zz48cGF0aCBmaWxsPSIjMDAwMDAwIiBkPSJNMTI4LjEsNS4xYzYzLDAsOTguOCw0OS40LDEwMy44LDEwNC42YzguOCw2LjcsMTQuMSwxNi44LDE0LjEsMjcuNWMwLDguOS0zLjQsMTcuMS05LjEsMjMuMmMtNC44LDUuMS0xMS4xLDguOS0xOC4yLDEwLjdjLTguOSwxNC44LTIxLjQsMjcuMy0zNi40LDM2LjFjLTEuMywwLjctMi41LDEuNS0zLjcsMi4ydjM2LjNjMCwyLjktMi40LDUuMi01LjUsNS4yYy0xLDAtMS45LTAuNC0yLjktMC44bC0xOC45LTExYy0yLjIsMi43LTUuNiw0LjUtOS40LDQuNWgtMjcuNGMtMy43LDAtNy4yLTEuOC05LjQtNC41bC0xOC45LDExYy0wLjgsMC40LTEuOCwwLjgtMi44LDAuOGMtMywwLTUuNS0yLjMtNS41LTUuMnYtMzYuNGMtMS4yLTAuNy0yLjUtMS40LTMuOC0yLjJjLTE1LTguOC0yNy42LTIxLjMtMzYuNC0zNi4xYy03LjEtMS44LTEzLjYtNS42LTE4LjItMTAuN2MtNS44LTYuMS05LjMtMTQuMi05LjMtMjMuMmMwLTEwLjYsNS4zLTIwLjgsMTQtMjcuNUMyOS4yLDU0LjUsNjUsNS4xLDEyOC4xLDUuMUwxMjguMSw1LjF6IE0xNjcuNCwyMTQuNEwxNjcuNCwyMTQuNGMtNC40LDEuOC05LjIsMy4zLTE0LDQuNnY5LjJsMTQsOC4zVjIxNC40TDE2Ny40LDIxNC40eiBNMTAyLjYsMjI4LjJMMTAyLjYsMjI4LjJWMjE5Yy00LjctMS4zLTkuNS0yLjgtMTQtNC42djIyTDEwMi42LDIyOC4yTDEwMi42LDIyOC4yeiBNMTQyLjUsMjIxTDE0Mi41LDIyMWMtNC44LDAuNy05LjYsMC45LTE0LjQsMC45Yy00LjksMC05LjgtMC4zLTE0LjUtMC45YzAsMy44LDAsNy43LDAsMTEuNWMwLDAuMiwwLjIsMC40LDAuMywwLjVjMC4xLDAuMSwwLjMsMC4zLDAuNSwwLjNoMjcuNGMwLjMsMCwwLjQtMC4xLDAuNS0wLjNjMC4yLTAuMSwwLjMtMC4zLDAuMy0wLjVDMTQyLjUsMjI4LjcsMTQyLjUsMjI0LjgsMTQyLjUsMjIxTDE0Mi41LDIyMXogTTk3LjUsMTMxLjdMOTcuNSwxMzEuN2M0LjksMCw5LjEsMy45LDkuMSw4LjZjMCw0LjgtNC4xLDguNi05LjEsOC42Yy00LjksMC05LjEtMy43LTkuMS04LjZDODguNCwxMzUuNiw5Mi42LDEzMS43LDk3LjUsMTMxLjdMOTcuNSwxMzEuN3ogTTE1OC42LDEzMS43TDE1OC42LDEzMS43YzQuOSwwLDksMy45LDksOC42YzAsNC44LTQuMSw4LjYtOSw4LjZjLTUuMSwwLTkuMS0zLjctOS4xLTguNkMxNDkuNSwxMzUuNiwxNTMuNiwxMzEuNywxNTguNiwxMzEuN0wxNTguNiwxMzEuN3ogTTk0LjQsMTc4LjZMOTQuNCwxNzguNmMtMi40LTEuNS0zLjItNC42LTEuNy03LjFjMS42LTIuNCw0LjktMy4yLDcuNS0xLjZjNC4yLDIuNSw4LjcsNC40LDEzLjMsNS43YzQuNywxLjQsOS41LDIsMTQuNSwyYzQuOSwwLDkuOC0wLjcsMTQuNC0yYzQuNi0xLjMsOS4yLTMuMiwxMy40LTUuN2MyLjYtMS42LDUuOS0wLjgsNy41LDEuNmMxLjcsMi41LDAuOCw1LjYtMS43LDcuMWMtNSwyLjktMTAuNCw1LjQtMTYuMiw2LjljLTUuNSwxLjYtMTEuNSwyLjUtMTcuNCwyLjVjLTYsMC0xMi0wLjktMTcuNS0yLjVDMTA0LjgsMTg0LDk5LjQsMTgxLjUsOTQuNCwxNzguNkw5NC40LDE3OC42eiBNMjE0LjQsMTE2LjFMMjE0LjQsMTE2LjFjLTM1LjgsNi44LTU5LjQsNC43LTc3LjItMy42Yy0xNS42LTctMjYuNS0xOC40LTM3LjQtMzIuMmMtMi44LDExLjctOS40LDIwLjEtMTguOCwyNmMtMTAuNCw2LjMtMjQsOS41LTM5LjUsMTAuMmMtMC41LDIuMy0xLjksNC4yLTQuMiw1LjRjLTUuNywzLjItOS4yLDktOS4yLDE1LjJjMCw0LjUsMS44LDguNyw0LjcsMTEuOGMyLjksMy4xLDcsNS40LDExLjYsNS45djBjMi45LDAuMyw1LjUsMiw2LjksNC42YzcuNCwxMy43LDE4LjUsMjUuMSwzMiwzMy4xYzEyLjksNy43LDI4LjIsMTIuMSw0NC43LDEyLjFjMTYuNCwwLDMxLjUtNC40LDQ0LjYtMTIuMWMxMy4zLTcuOCwyNC4zLTE5LjEsMzEuNi0zMi40YzEuMi0yLjksMy45LTUsNy4zLTUuNGM0LjYtMC41LDguOC0yLjgsMTEuNy01LjljMi44LTMuMSw0LjYtNy4zLDQuNi0xMS44YzAtNi4yLTMuNS0xMi05LjMtMTUuMkMyMTYuNSwxMjAuNiwyMTQuOSwxMTguNSwyMTQuNCwxMTYuMUwyMTQuNCwxMTYuMXoiLz48L2c+PC9nPg0KPC9zdmc+"
const UserProfile = ({ student }) => {
    console.log(getFile(student?.student_photo))
    return (
        // <Dialog
        //     fullWidth
        //     maxWidth="lg"
        //     open={true}
        //     // onClose={() => {
        //     //     setStudentProfileModal(false);
        //     // }}
        //     sx={{ paddingX: { xs: 3, md: 0 } }}
        // >
        <Card sx={{ m: 1, borderRadius: 0.5 }}>
            <Grid sx={{
                display: 'grid',
                gridTemplateColumns: {
                    md: '25% 75%',
                    sm: 'auto'
                },
                p: 2
            }}>
                <Grid sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    gap: 2,
                    p: 2
                }}>
                    <Image src={student?.student_photo ? getFile(student?.student_photo) : student?.student_info?.gender === "male" ? boy_photo : girl_photo}
                        height={100}
                        width={100}
                        alt='Student photo'
                        loading='lazy'
                        style={{
                            // borderRadius: '25%',
                            objectFit: "contain"
                        }}
                    />
                    <Typography variant='h3' align='center'>{[student?.student_info?.first_name, student?.student_info?.middle_name, student?.student_info?.last_name]?.join(' ')}</Typography>
                    <Typography variant='h4' align='center'>Class registration no : {student?.class_registration_no}</Typography>

                    <Grid sx={{
                        display: 'grid',
                        gridTemplateColumns: 'auto auto',
                        gap: 3
                    }}>
                        <Typography variant='h6'>Group : <br /> {student?.group?.title}</Typography>
                        <Typography variant='h6'>Admission date : <br /> {dayjs(student?.created_at).format('DD/MM/YYYY')}</Typography>
                        <Typography variant='h6'>Academic year : <br /> {student?.academic_year?.title}</Typography>
                        <Typography variant='h6'>Roll : <br /> {student?.class_roll_no}</Typography>
                        <Typography variant='h6'>Class : <br /> {student?.section?.class?.name}</Typography>
                        <Typography variant='h6'>Section : <br /> {student?.section?.name}</Typography>
                        <Typography variant='h6'>Date of birth : <br /> {dayjs(student?.student_info?.date_of_birth).format('DD/MM/YYYY')}</Typography>
                        <Typography variant='h6'>Blood group : <br /> {student?.student_info?.blood_group}</Typography>

                    </Grid>
                    <Typography variant='h5'>First admission date : {dayjs(student?.student_info?.admission_date).format('DD/MM/YYYY')}</Typography>

                </Grid>

                <Grid sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 2,
                    borderLeft: {
                        md: '1px solid lightgrey'
                    }
                }}>
                    <Grid>
                        <Typography align='center' variant='h3' p={2} borderBottom={'1px dashed lightgrey'}>Basic Information</Typography>
                        <Grid sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                md: 'auto auto',
                                sm: 'auto'
                            },
                            gap: 2
                        }}>
                            <Grid sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                pt: 2
                            }}>
                                <Typography variant='h6'>User name :<br /><Typography variant='h5'> {student?.student_info?.user?.username}</Typography> </Typography>
                                <Typography variant='h6'>Gender :<br /><Typography variant='h5'>  {student?.student_info?.gender}</Typography></Typography>
                                <Typography variant='h6'>Phone :<br /> <Typography variant='h5'> {student?.student_info?.phone}</Typography></Typography>
                                <Typography variant='h6'>Religion :<br /><Typography variant='h5'>  {student?.student_info?.religion}</Typography></Typography>
                            </Grid>
                            <Grid borderLeft={'1px dashed lightgrey'} pl={2} sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                pt: 2
                            }}>
                                <Typography variant='h6'>Email :<br /><Typography variant='h5'>  {student?.student_info?.email}</Typography></Typography>
                                <Typography variant='h6'>Birth certificate or NID :<br /><Typography variant='h5'> {student?.student_info?.national_id}</Typography> </Typography>
                                <Typography variant='h6'>Previous school :<br /><Typography variant='h5'>  {student?.student_info?.previous_school}</Typography></Typography>
                                <Typography variant='h6'>Present address :<br /><Typography variant='h5'>{student?.student_present_address} </Typography> </Typography>
                                <Typography variant='h6'>Permanent address :<br /><Typography variant='h5'>  {student?.student_info?.student_permanent_address}</Typography></Typography>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid>
                        <Typography align='center' variant='h3' p={2} borderBottom={'1px dashed lightgrey'}>Guardian Information</Typography>
                        <Grid sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                md: 'auto auto',
                                sm: 'auto'
                            },
                            gap: 2
                        }}>
                            <Grid sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                pt: 2
                            }}>
                                <Typography variant='h6'>Guardian name :<br /><Typography variant='h5'> {student?.guardian_name}</Typography></Typography>
                                <Typography variant='h6'>Relation with guardian :<br /><Typography variant='h5'> {student?.relation_with_guardian}</Typography></Typography>
                                <Typography variant='h6'>Guardian phone :<br /><Typography variant='h5'> {student?.guardian_phone}</Typography></Typography>
                                <Typography variant='h6'>Guardian profession :<br /><Typography variant='h5'> {student?.guardian_profession}</Typography></Typography>
                            </Grid>
                            <Grid borderLeft={'1px dashed lightgrey'} pl={2} sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                                pt: 2
                            }}>
                                <Typography variant='h6'>Father's name :<br /> <Typography variant='h5'>{student?.student_info?.father_name}</Typography></Typography>
                                <Typography variant='h6'>Father's phone :<br /> <Typography variant='h5'>{student?.student_info?.father_phone}</Typography></Typography>
                                <Typography variant='h6'>Father's profession :<br /> <Typography variant='h5'>{student?.student_info?.father_profession}</Typography></Typography>

                                <Typography variant='h6'>Mother's name :<br /> <Typography variant='h5'>{student?.student_info?.mother_name}</Typography></Typography>
                                <Typography variant='h6'>Mother's phone :<br /> <Typography variant='h5'>{student?.student_info?.mother_phone}</Typography></Typography>
                                <Typography variant='h6'>Mother's profession :<br /> <Typography variant='h5'>  {student?.student_info?.mother_profession}</Typography></Typography>

                            </Grid>
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>
        </Card>
    )
}

export default UserProfile;