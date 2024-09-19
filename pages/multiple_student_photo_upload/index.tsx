import Head from 'next/head';
import { Authenticated } from 'src/components/Authenticated';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Typography, Grid } from '@mui/material';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { SearchingButtonWrapper } from '@/components/ButtonWrapper';
import TableContainer from '@mui/material/TableContainer';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import { TableBodyCellWrapper, TableHeaderCellWrapper } from '@/components/Table/Table';
import { useClientFetch } from 'src/hooks/useClientFetch';
import axios from 'axios';
import useNotistick from '@/hooks/useNotistick';
import Footer from '@/components/Footer';
import { styled } from '@mui/material/styles';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/hooks/useAuth';
import { AcademicYearContext, Students } from '@/contexts/UtilsContextUse';
import {
  FileUploadFieldWrapper,
  NewFileUploadFieldWrapper,
  PreviewImageCardStudentPhotoUpload,
  TextFieldWrapper,
  DisableTextWrapper
} from '@/components/TextFields';
import { useState, ChangeEvent, useEffect, useCallback, useContext } from 'react';
import { getFile } from '@/utils/utilitY-functions';
const persionNameList = ['Student Photo', 'Guardian Photo', 'Father Photo', 'Mother Photo'];

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: 'rgba(0, 0, 0, 0.03)'
  },
  ':hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.10)'
  }
}));

const MultipleStudentPhotoUpload = () => {
  const { user } = useAuth();
  const { showNotification } = useNotistick();
  const { data: classData, error: classError } = useClientFetch('/api/class');
  const [selectedClass, setSelectedClass] = useState(null);
  const [sections, setSections] = useState<Array<any>>([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [groups, setGroups] = useState<Array<any>>([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [studentFees, setStudentFees] = useState<Array<any>>([]);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(persionNameList[0]);
  const { data: classes } = useClientFetch(`/api/class?school_id=${user?.school_id}`);
  const [students, setStudents] = useContext<any[]>(Students);
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const [previousValues, setPreviousValues] = useState<Array<any>>([]);

  const handlePersionSelect = (event: ChangeEvent<HTMLInputElement>, newValue) => {
    setSelectedPerson(newValue);
    setPreviousValues([]);
  };

  const handleClassSelect = (event, newValue) => {
    setSelectedClass(newValue);
    setSelectedSection(null);
    setStudents(null);

    if (newValue) {
      const targetClassSections = classes.find((i) => i.id == newValue.id);
      const sections = targetClassSections?.sections?.map((i) => {
        return {
          label: i.name,
          id: i.id
        };
      });
      sections.push({
        label: 'All Batch',
        id: 'all'
      });
      setSections(sections);
      if (!newValue.has_section) {
        setSelectedSection({
          label: targetClassSections?.sections[0]?.name,
          id: targetClassSections?.sections[0]?.id
        });
      } else {
        setSelectedSection(null);
      }
    }
  };

  // Debounce function
  const debounce = (func, delay) => {
    let timerId;
    return function (...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  const handleClickStudentInfo = debounce(async () => {
    try {
      if (academicYear && selectedSection) {
        const res = await axios.get(
          `/api/student/?${selectedSection.id == 'all' ? `class_id=${selectedClass?.id}` : `section_id=${selectedSection?.id}`}&academic_year_id=${
            academicYear?.id
          }`
        );

        setStudents({ AllStudents: res.data, selectedClass, selectedSection });
      }
    } catch (error) {
      // console.log(error);
    }
  }, 1000);

  const handleFileChange = (e, setFieldValue, field, preview_field, student_id, id) => {
    if (e?.target?.files?.length === 0) {
      setFieldValue(field, '');
      setFieldValue(preview_field, []);
      setFieldValue(student_id, []);
      return;
    }

    setFieldValue(field, e.target.files[0]);

    const imgPrev = [];

    if (selectedPerson === 'Student Photo') {
      Array.prototype.forEach.call(e.target.files, (file) => {
        const objectUrl = URL.createObjectURL(file);
        imgPrev.push({ name: file.name, src: objectUrl, studentId: id, student_photo: true });
      });
    } else if (selectedPerson === 'Guardian Photo') {
      Array.prototype.forEach.call(e.target.files, (file) => {
        const objectUrl = URL.createObjectURL(file);
        imgPrev.push({ name: file.name, src: objectUrl, studentId: id, guardian_photo: true });
      });
    } else if (selectedPerson === 'Father Photo') {
      Array.prototype.forEach.call(e.target.files, (file) => {
        const objectUrl = URL.createObjectURL(file);
        imgPrev.push({ name: file.name, src: objectUrl, studentId: id, father_photo: true });
      });
    } else if (selectedPerson === 'Mother Photo') {
      Array.prototype.forEach.call(e.target.files, (file) => {
        const objectUrl = URL.createObjectURL(file);
        imgPrev.push({ name: file.name, src: objectUrl, studentId: id, mother_photo: true });
      });
    }

    setFieldValue(preview_field, imgPrev);
    setFieldValue(student_id, [id]);

    // filtering state
    const filterStateArr = previousValues.filter((item) => {
      return item.studentId !== imgPrev[0].studentId;
    });

    // state value

    setPreviousValues((prev) => [
      ...filterStateArr,
      {
        ...imgPrev[0]
      }
    ]);
  };

  const handleRemove = (id, setFieldValue, field, preview_field) => {
    setFieldValue(field, '');
    setFieldValue(preview_field, []);
    const Items = previousValues.filter((item) => {
      return item?.studentId !== id;
    });

    setPreviousValues(Items);
  };

  function DisplayImage(item, id, setFieldValue) {
    const singleStudent = previousValues.find((item) => {
      return item?.studentId === id;
    });

    if (singleStudent) {
      return (
        <PreviewImageCardStudentPhotoUpload
          data={{
            name: singleStudent?.name,

            src: singleStudent?.src
          }}
          index={singleStudent.studentId}
          key={singleStudent.studentId}
          handleRemove={() => handleRemove(id, setFieldValue, 'user_photo', 'preview_user_photo')}
          removeBtn={true}
        />
      );
    } else {
      if (selectedPerson === 'Student Photo') {
        if (item?.student_photo) {
          return (
            <PreviewImageCardStudentPhotoUpload
              data={{
                name: item?.student_info?.first_name,
                src: item?.student_photo,
                database: true
              }}
              index={item?.student_photo}
              key={item?.student_photo}
              // handleRemove={() => handleRemove(id, setFieldValue, 'user_photo', 'preview_user_photo')}
              handleRemove={() => {}}
              removeBtn={false}
            />
          );
        }
      } else if (selectedPerson === 'Guardian Photo') {
        if (item?.guardian_photo) {
          return (
            <PreviewImageCardStudentPhotoUpload
              data={{
                name: item?.student_info?.guardian_name,
                src: item?.guardian_photo,
                database: true
              }}
              index={item?.guardian_photo}
              key={item?.guardian_photo}
              // handleRemove={() => handleRemove(id, setFieldValue, 'user_photo', 'preview_user_photo')}
              handleRemove={() => {}}
              removeBtn={false}
            />
          );
        }
      } else if (selectedPerson === 'Father Photo') {
        if (item?.student_info?.father_photo) {
          return (
            <PreviewImageCardStudentPhotoUpload
              data={{
                name: item?.student_info?.father_name,
                src: item?.student_info?.father_photo,
                database: true
              }}
              index={item?.student_info?.father_photo}
              key={item?.student_info?.father_photo}
              // handleRemove={() => handleRemove(id, setFieldValue, 'user_photo', 'preview_user_photo')}
              handleRemove={() => {}}
              removeBtn={false}
            />
          );
        }
      } else if (selectedPerson === 'Mother Photo') {
        if (item?.student_info?.mother_photo) {
          return (
            <PreviewImageCardStudentPhotoUpload
              data={{
                name: item?.student_info?.mother_name,
                src: item?.student_info?.mother_photo,
                database: true
              }}
              index={item?.student_info?.mother_photo}
              key={item?.student_info?.mother_photo}
              // handleRemove={() => handleRemove(id, setFieldValue, 'user_photo', 'preview_user_photo')}
              handleRemove={() => {}}
              removeBtn={false}
            />
          );
        }
      }
    }

    return <></>;
  }

  const handleSubmit = debounce(async () => {
    const files = previousValues;

    // updated code start

    const formData = new FormData();

    // updated code end
    for (const fileObj of files) {
      try {
        const response = await fetch(fileObj.src);
        const blob = await response.blob();

        const validTypes = ['image/jpeg', 'image/png'];
        if (!validTypes.includes(blob.type)) {
          continue;
        }

        const file = new File([blob], fileObj.name, { type: blob.type });
        formData.append(fileObj.studentId, file);

        Object.keys(fileObj).forEach((key) => {
          if (key !== 'src' && key !== 'name') {
            formData.append(key, fileObj[key]);
          }
        });
      } catch (error) {}
    }

    // updated code start

    try {
      const response = await axios.patch('/api/student/multiple_photo_upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response?.status === 200) {
        handleClickStudentInfo();
        setPreviousValues([]);
        showNotification(`${selectedPerson} images updated successfully`, 'success');
        return;
      } else {
        throw new Error('Failed to  uploading file');
      }
    } catch (error) {
      if (error?.response?.data?.error) {
        showNotification(`${error?.response?.data?.error}`, 'error');
      } else if (error?.message) {
        showNotification(`${error?.message}`, 'error');
      }
    }

    // updated code end
  }, 1000);

  return (
    <>
      <Head>
        <title>Student_Photo_Update</title>
      </Head>
      <Typography
        variant="h4"
        textTransform="uppercase"
        py={{
          md: 3,
          xs: 2
        }}
        px={2}
      >
        Student Photo Update
      </Typography>
      {/* searching part code start */}
      <Grid display="grid" gridTemplateColumns="1fr" rowGap={{ xs: 1, md: 0 }} px={1} mt={1} minHeight="fit-content">
        {/* split your code start */}
        <Grid
          sx={{
            overflow: 'hidden',
            backgroundColor: '#fff'
          }}
        >
          <Grid px={1} pt="9px">
            <Grid
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                columnGap: '20px',
                rowGap: '0',
                flexWrap: 'wrap'
              }}
            >
              {/* Select person field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    // md: '30%',
                    // xl: '15%'
                    md: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper
                  options={persionNameList}
                  value={selectedPerson}
                  label="Field *"
                  placeholder="--Select--"
                  handleChange={handlePersionSelect}
                />
              </Grid>
              {/* Class field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    //  md: '30%',
                    // xl: '15%'
                    md: '15%'
                  },
                  flexGrow: 1
                }}
              >
                <AutoCompleteWrapper
                  label="Select class"
                  placeholder="Select a Class"
                  options={
                    classes?.map((i) => {
                      return {
                        label: i.name,
                        id: i.id,
                        has_section: i.has_section
                      };
                    }) || []
                  }
                  value={selectedClass}
                  handleChange={handleClassSelect}
                />
              </Grid>

              {/* Section field */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    // md: '30%',
                    //  xl: '15%'
                    md: '15%'
                  },
                  flexGrow: 1
                }}
              >
                {selectedClass && selectedClass.has_section && sections ? (
                  <AutoCompleteWrapper
                    label="Select Batch"
                    placeholder="batch..."
                    options={sections}
                    value={selectedSection}
                    handleChange={(e, v) => {
                      setSelectedSection(v);
                      setStudents(null);
                    }}
                  />
                ) : (
                  <DisableTextWrapper label="Select Batch" touched={undefined} errors={undefined} value={undefined} />
                )}
              </Grid>

              {/* Search button */}
              <Grid
                sx={{
                  flexBasis: {
                    xs: '100%',
                    sm: '40%',
                    // md: '30%',
                    // xl: '15%'
                    md: '15%'
                  },
                  flexGrow: 1,
                  position: 'relative',
                  display: 'flex',
                  gap: 1
                }}
              >
                <Grid
                  sx={{
                    flexGrow: 1
                  }}
                >
                  <SearchingButtonWrapper isLoading={false} handleClick={handleClickStudentInfo} disabled={false} children={'Search'} />
                </Grid>
                {/* <Grid
                  sx={{
                    flexGrow: 1
                  }}
                >
                  <SearchingButtonWrapper isLoading={false} handleClick={() => {}} disabled={false} children={'Print'} />
                </Grid> */}
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* split your code end */}
      </Grid>
      {/* searching part code end */}

      {/* table code part start */}

      <Grid
        mt={3}
        mb={4}
        px={1}
        sx={{
          width: {
            xs: '100vw',
            md: '100%'
          },
          minHeight: {
            xs: 150,
            md: 'calc(100dvh - 378px)'
          }
        }}
      >
        {/* Form code start */}

        <Formik
          initialValues={{
            user_photo: '',
            preview_user_photo: [],
            student_id: []
          }}
          onSubmit={(_values, getValue: any) => {
            //handleFormSubmit(_values, getValue);
          }}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue, setErrors }) => {
            return (
              <form onSubmit={handleSubmit}>
                <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
                  <Table sx={{ minWidth: 650, maxWidth: 'calc(100%-10px)' }} size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCellWrapper style={{ width: '1%', py: 0.5 }}>SL</TableHeaderCellWrapper>
                        <TableHeaderCellWrapper>Student Name</TableHeaderCellWrapper>
                        {selectedPerson && <TableHeaderCellWrapper style={{ width: { xs: '40%', md: '25%' } }}>Action</TableHeaderCellWrapper>}
                        {selectedPerson && <TableHeaderCellWrapper>{selectedPerson}</TableHeaderCellWrapper>}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students?.AllStudents?.map((item, i) => {
                        return (
                          <StyledTableRow key={i}>
                            <TableBodyCellWrapper>
                              <Grid py={0.5}>{i + 1}</Grid>{' '}
                            </TableBodyCellWrapper>
                            <TableBodyCellWrapper>{`${item.student_info.first_name ? item.student_info.first_name + ' ' : ''}${
                              item.student_info.middle_name ? item.student_info.middle_name + ' ' : ''
                            }${item.student_info.last_name ? item.student_info.last_name + ' ' : ''}`}</TableBodyCellWrapper>
                            {selectedPerson && (
                              <TableBodyCellWrapper>
                                <Grid py={0.5}>
                                  {' '}
                                  <NewFileUploadFieldWrapper
                                    htmlFor="user_photo"
                                    //  accept="image/*"
                                    accept=".jpg,.jpeg,.png"
                                    handleChangeFile={(e) =>
                                      handleFileChange(e, setFieldValue, 'user_photo', 'preview_user_photo', 'student_id', item?.student_info?.id)
                                    }
                                    label={`${selectedPerson ? `Upload ${selectedPerson}` : 'Upload Student Photo'}`}
                                    height={40}
                                    marginBottom={0}
                                  />
                                </Grid>
                              </TableBodyCellWrapper>
                            )}

                            {selectedPerson && (
                              <TableBodyCellWrapper>
                                <Grid py={0.5}>{DisplayImage(item, item?.student_info?.id, setFieldValue)}</Grid>
                              </TableBodyCellWrapper>
                            )}
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </form>
            );
          }}
        </Formik>

        {/* Form code end */}
      </Grid>
      {/* table code part end */}
      <Grid px={1}>
        <SearchingButtonWrapper sx={{ mt: 2 }} isLoading={false} handleClick={handleSubmit}>
          Submit
        </SearchingButtonWrapper>
      </Grid>
      {/* footer */}
      <Footer />
    </>
  );
};

MultipleStudentPhotoUpload.getLayout = (page) => (
  // <Authenticated requiredPermissions={['multiple_student_photo_upload', 'multiple_student_photo_upload']}>
  <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  // </Authenticated>
);

export default MultipleStudentPhotoUpload;
