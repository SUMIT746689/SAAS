import { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import Head from 'next/head';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';

import { Button, Card, Chip, Dialog, DialogTitle, Grid, Typography } from '@mui/material';
import { useRefMounted } from 'src/hooks/useRefMounted';

import PageTitleWrapper from 'src/components/PageTitleWrapper';

import Results from 'src/content/Management/Students/Results';
// import RegistrationFirstPart from '@/content/Management/Students/RegistrationFirstPart';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { AcademicYearContext, Students } from '@/contexts/UtilsContextUse';
import { useRef } from 'react';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
import { useAuth } from '@/hooks/useAuth';
import { useClientFetch } from '@/hooks/useClientFetch';
import Footer from '@/components/Footer';
import { ExportData } from '@/content/Management/Students/ExportData';
import { NewFileUploadFieldWrapper } from '@/components/TextFields';
import useNotistick from '@/hooks/useNotistick';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { ButtonWrapper, SearchingButtonWrapper } from '@/components/ButtonWrapper';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { read, utils } from 'xlsx';
import { handleCreateFileObj } from 'utilities_api/handleCreateFileObject';
import CloseIcon from '@mui/icons-material/Close';
import { HighestStudentIdContext } from '@/contexts/HighestStudentIdContext';

function ManagementClasses() {
  const [students, setStudents] = useContext<any[]>(Students);

  const { t }: { t: any } = useTranslation();
  const router = useRouter();
  const [academicYear, setAcademicYear] = useContext(AcademicYearContext);
  const { user } = useAuth();
  const { showNotification } = useNotistick();

  const [sections, setSections] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [discount, setDiscount] = useState([]);
  const [fee, setFee] = useState([]);
  const [openBulkStdUpload, setOpenBulkStdUpload] = useState(false);
  const [isDownloadingExcelFile, setIsDownloadingExcelFile] = useState(false);
  const idCard = useRef();

  const { data: classes } = useClientFetch(`/api/class?school_id=${user?.school_id}`);

  useEffect(() => {
    if (selectedClass && academicYear && selectedSection) handleStudentList();
  }, [selectedClass, academicYear, selectedSection]);

  useEffect(() => {
    if (students?.selectedClass) {
      setSelectedClass(students?.selectedClass);
      axios.get(`/api/class/${students?.selectedClass?.id}`).then((res) => {
        const sections = res?.data?.sections?.map((i) => ({
          label: i.name,
          id: i.id
        }));
        sections.push({
          label: 'All Batch',
          id: 'all'
        });
        setSections(sections);
        if (students?.selectedSection) {
          setSelectedSection(sections?.find((i) => i.id == students?.selectedSection?.id));
        }
      });
    }
  }, [!selectedClass, !selectedSection]);

  useEffect(() => {
    if (selectedClass && academicYear) {
      axios
        .get(`/api/discount?class_wise=true&class_id=${selectedClass?.id}&academic_year_id=${academicYear?.id}`)
        .then((res) => {
          console.log('discount__', res.data);
          setDiscount(
            res.data?.map((i) => ({
              label: `${i?.fee?.fees_head?.title}, ${i?.fee?.title}, ${i?.title} (${i?.amt} ${i?.type})`,
              id: i.id,
              subject_id: i.fee?.subject_id
            }))
          );
        })
        .catch((err) => console.log(err));
      axios
        .get(`/api/fee?class_id=${selectedClass?.id}&academic_year_id=${academicYear?.id}`)
        .then((res) =>
          setFee(
            res?.data?.data?.map((i) => ({
              // label: i.title,
              label: `${i?.fees_head?.title}, ${i?.fees_month}, ${i?.subject?.name || ''}`,
              id: i.id
            }))
          )
        )
        .catch((err) => console.log(err));
    }
  }, [selectedClass, academicYear]);

  const handleStudentList = () => {
    if (academicYear && selectedSection) {
      axios
        .get(
          `/api/student/?${selectedSection.id == 'all' ? `class_id=${selectedClass?.id}` : `section_id=${selectedSection?.id}`}&academic_year_id=${academicYear?.id
          }`
        )
        .then((res) => {
          console.log('ref__', res.data);
          setStudents({
            AllStudents: res.data,
            selectedClass,
            selectedSection
          });
        });
    }
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

  const handleSendToRegistrationPage = () => {
    router.push('/management/students/registration');
  };

  const handlePrint = useReactToPrint({
    content: () => idCard.current
    // pageStyle: `@media print {
    //   @page {
    //     size: 210mm 115mm;
    //   }
    // }`
  });

  const handleDownloadStudentExcelFile = async () => {
    setIsDownloadingExcelFile(true);
    await axios
      .get('/api/student/downloads?format=excel&is_all_student=true')
      .then((res) => {
        const type = res.headers['content-type'];
        const fileName = res.headers['file-name'];
        const blob = new Blob([res.data], { type: type });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
      })
      .catch((err) => handleShowErrMsg(err, showNotification))
      .finally(() => {
        setIsDownloadingExcelFile(false);
      });
  };
  console.log({ discount })
  return (
    <>
      <BulkStudentUpload class_id={selectedClass?.id} section_id={selectedSection?.id} open={openBulkStdUpload} setOpen={setOpenBulkStdUpload} />
      <Head>
        <title>Students - Management</title>
      </Head>

      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              {t('Student Management')}
            </Typography>
            <Typography variant="subtitle2">{t('All aspects related to the students can be managed from this page')}</Typography>
          </Grid>

          <Grid item my="auto">
            <ButtonWrapper handleClick={handleSendToRegistrationPage}>{t('Registration student')}</ButtonWrapper>
          </Grid>
        </Grid>
      </PageTitleWrapper>

      <Card
        sx={{
          mx: { sm: 4, xs: 1 },
          p: 1,
          pb: 0,
          mb: 2,
          display: 'grid',
          gridTemplateColumns: { sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          columnGap: 1
        }}
      >
        <ButtonWrapper handleClick={undefined} href={`/Student-Bulk-Import-Sample.xlsx`}>
          Download Excel format
        </ButtonWrapper>
        <ButtonWrapper handleClick={() => setOpenBulkStdUpload(true)}>Upload Bulk Student</ButtonWrapper>
        <SearchingButtonWrapper disabled={isDownloadingExcelFile} isLoading={isDownloadingExcelFile} handleClick={handleDownloadStudentExcelFile}>
          Downlaod All Student List (Excel Format)
        </SearchingButtonWrapper>
      </Card>

      <Card
        sx={{
          mx: { sm: 4, xs: 1 },
          p: 1,
          pb: 0,
          mb: 1,
          display: 'grid',
          gridTemplateColumns: {
            sm: '1fr 1fr 1fr',
            md: '1fr 1fr 1fr 1fr auto'
          },
          columnGap: 1
        }}
      >
        {/* select class */}

        <AutoCompleteWrapper
          label="Select class"
          placeholder="Class..."
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

        {selectedClass && selectedClass.has_section && sections && (
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
        )}
        {selectedSection && <ButtonWrapper handleClick={handleStudentList}> Find</ButtonWrapper>}
        {students?.AllStudents?.length > 0 && (
          <ButtonWrapper handleClick={handlePrint} startIcon={<LocalPrintshopIcon />}>
            Print Id Card
          </ButtonWrapper>
        )}
        <Grid>
          <ExportData students={students?.AllStudents} />
        </Grid>
      </Card>

      <Grid sx={{ px: 1 }} container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item xs={12} sx={{ width: { xs: '100vw', md: '100%' }, minWidth: '150px' }}>
          <Results students={students?.AllStudents || []} refetch={handleStudentList} discount={discount} fee={fee} idCard={idCard} />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

ManagementClasses.getLayout = (page) => (
  <Authenticated name="student">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default ManagementClasses;

const BulkStudentUpload = ({ section_id, class_id, open, setOpen }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [excelFileUpload, setExcelFileUpload] = useState(null);
  const { showNotification } = useNotistick();
  const { t }: { t: any } = useTranslation();
  const [failedForUniqueStudentId, setFailedForUniqueStudentId] = useState([]);
  const [faildedCreateStd, setFaildedCreateStd] = useState([]);
  const { handleFetchHighestStudentId } = useContext(HighestStudentIdContext)

  const handleExcelUpload = () => {
    // console.log(excelFileUpload);
    setIsLoading(true);
    if (!excelFileUpload) {
      setIsLoading(false);
      return showNotification('upload a student file', 'error');
    }
    const form = new FormData();
    if (!class_id || !section_id) {
      setIsLoading(false);
      return showNotification('class/section not selected', 'error');
    }
    if (typeof section_id !== 'number') {
      setIsLoading(false);
      return showNotification('select a single section', 'error');
    }
    form.append('students', excelFileUpload);
    form.append('class_id', class_id);
    form.append('section_id', String(section_id));

    axios
      .post('/api/student/bulk-admission', form)
      .then((res) => {
        setFaildedCreateStd([]);
        setFailedForUniqueStudentId([]);
        setExcelFileUpload(null);
        showNotification(
          t(
            `${res?.data?.message}, ${Array.isArray(res?.data?.faildedCreateStd) && res?.data?.faildedCreateStd.length > 0
              ? '(failed:' + res?.data?.faildedCreateStd + ')'
              : ''
            }`
          )
        );
        setFaildedCreateStd(res?.data?.faildedCreateStd || []);
        setFailedForUniqueStudentId(res?.data?.failedForUniqueStudentId || []);
        handleFetchHighestStudentId();
      })
      .catch((err) => {
        setFailedForUniqueStudentId(err.response?.data?.failedForUniqueStudentId || []);
        console.log({ err })
        handleShowErrMsg(err, showNotification);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleModalClose = () => {
    setOpen(close);
  };

  const handleUplaodFileChange = async (event) => {
    if (!event.target.files[0]) return;
    const reader = new FileReader();

    reader.onload = async function (e) {
      const data = e.target.result;
      const workbook = read(data, { type: 'array' });
      /* DO SOMETHING WITH workbook HERE */
      const firstSheetName = workbook.SheetNames[0];
      /* Get worksheet */
      const worksheet = workbook.Sheets[firstSheetName];
      const excelArrayDatas = utils.sheet_to_json(worksheet, { raw: true });
      // setFieldValue("contact_column", null)

      if (excelArrayDatas.length > 30_000) {
        showNotification('file is to large', 'error');
        setExcelFileUpload(null);
        // setSelectSheetHeaders(() => []);
        return;
      }

      // set upload file
      const { err, files, objFiles } = handleCreateFileObj(event);
      if (err) showNotification(err, 'error');
      setExcelFileUpload(files[0]);
      // setFieldValue('preview_contact_file', objFiles[0]);
    };
    reader.readAsArrayBuffer(event.target.files[0]);
  };
  console.log({ faildedCreateStd, failedForUniqueStudentId })
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleModalClose}>
      <DialogTitle display="flex" justifyContent="space-between" sx={{ p: 3 }}>
        <Grid>
          <Typography variant="h4" gutterBottom>
            {t('Add new Section')}
          </Typography>
          <Typography variant="subtitle2">{t('Fill in the fields below to create and add a new section')}</Typography>
        </Grid>
        <CloseIcon
          onClick={handleModalClose}
          sx={{
            cursor: 'pointer',
            borderRadius: 0.5,
            p: 0.5,
            fontSize: 30,
            color: (themes) => themes.colors.primary.dark,
            border: (themes) => `1px solid ${themes.colors.primary.dark}`
          }}
        />
      </DialogTitle>

      <Grid px={3} pb={4}>
        <Grid pb={4}>
          <Grid>Upload Student File: (.xlsx, .xls, .csv, text/csv) *</Grid>
          <Grid item width="100%">
            <NewFileUploadFieldWrapper
              label="Upload Excel file"
              htmlFor="student_upload_file"
              accept=".xlsx, .xls, .csv, text/csv"
              handleChangeFile={(event) => {
                handleUplaodFileChange(event);
              }}
            />
          </Grid>

          {excelFileUpload?.name && (
            <Grid>
              <Grid color="#57ca22" width="100%" fontWeight={500}>
                Upload File Name:
              </Grid>
              <Grid>
                <Chip variant="outlined" label="File Name: " sx={{ borderRadius: 0, height: 40 }} />
                <Chip color="success" variant="outlined" label={excelFileUpload.name} sx={{ borderRadius: 0, height: 40 }} />
                <Chip
                  color="warning"
                  label="Remove"
                  variant="outlined"
                  sx={{ borderRadius: 0.5, px: 1, py: 2, ml: 0.5 }}
                  onClick={() => {
                    setExcelFileUpload(null);
                  }}
                />
              </Grid>
            </Grid>
          )}

          {faildedCreateStd.length > 0 &&
            <Grid p={1} color={"red"} border="1px solid red">
              Failed Student Ids: {faildedCreateStd.join(', ')}
            </Grid>
          }

          {failedForUniqueStudentId.length > 0 &&
            <Grid p={1} mt={1} color={"red"} border="1px solid red">
              Failed for Unique Student Ids: {failedForUniqueStudentId.join(', ')}
            </Grid>
          }

        </Grid>

        <SearchingButtonWrapper isLoading={isLoading} disabled={isLoading} handleClick={handleExcelUpload}>
          {t('Bulk admission')}
        </SearchingButtonWrapper>
      </Grid>
    </Dialog>
  );
};
