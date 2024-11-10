import { useState, useEffect, useCallback, useContext, ChangeEvent } from 'react';
import axios from 'axios';
import Head from 'next/head';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import ExtendedSidebarLayout from 'src/layouts/ExtendedSidebarLayout';
import { Authenticated } from 'src/components/Authenticated';
import { Card, Chip, Dialog, DialogTitle, Grid, Typography, Box, TextField, InputAdornment } from '@mui/material';
import PageTitleWrapper from 'src/components/PageTitleWrapper';
import Results from '@/content/Management/Students/separated_students/list/Results';
// import RegistrationFirstPart from '@/content/Management/Students/RegistrationFirstPart';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { AcademicYearContext, Students } from '@/contexts/UtilsContextUse';
import { useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useClientFetch } from '@/hooks/useClientFetch';
import Footer from '@/components/Footer';
import { NewFileUploadFieldWrapper } from '@/components/TextFields';
import useNotistick from '@/hooks/useNotistick';
import { AutoCompleteWrapper } from '@/components/AutoCompleteWrapper';
import { SearchingButtonWrapper } from '@/components/ButtonWrapper';
import { handleShowErrMsg } from 'utilities_api/handleShowErrMsg';
import { read, utils } from 'xlsx';
import { handleCreateFileObj } from 'utilities_api/handleCreateFileObject';
import CloseIcon from '@mui/icons-material/Close';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
function SeparatedStudentsList() {
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
  const [selectedItems, setSelectedUsers] = useState<string[]>([]);
  const [query, setQuery] = useState<string>('');
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
        .get(`/api/discount?class_id=${selectedClass?.id}&academic_year_id=${academicYear?.id}`)
        .then((res) => {
          setDiscount(
            res.data?.map((i) => ({
              label: `${i?.title} (${i?.amt} ${i?.type})`,
              id: i.id
            }))
          );
        })
        .catch((err) => console.log(err));
      axios
        .get(`/api/fee?class_id=${selectedClass?.id}&academic_year_id=${academicYear?.id}`)
        .then((res) =>
          setFee(
            res?.data?.data?.map((i) => ({
              label: i.title,
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
          `/api/student/separated_students_list?${
            selectedSection.id == 'all' ? `class_id=${selectedClass?.id}` : `section_id=${selectedSection?.id}`
          }&academic_year_id=${academicYear?.id}`
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
    setSelectedUsers([]);

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

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>): void => {
    event.persist();
    setQuery(event.target.value);
  };

  return (
    <>
      <Head>
        <title>Separated_Students_list</title>
      </Head>

      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              {t('Separated Students List')}
            </Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>

      {/* search code start */}
      <Card
        sx={{
          mx: 1,
          p: 1,
          mb: 2
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box p={0.5}>
              <TextField
                size="small"
                sx={{
                  m: 0
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchTwoToneIcon />
                    </InputAdornment>
                  )
                }}
                onChange={handleQueryChange}
                placeholder={t('Search by student name, username or phone number...')}
                value={query}
                fullWidth
                variant="outlined"
              />
            </Box>
          </Grid>
        </Grid>
      </Card>
      {/* search code end */}

      <Card
        sx={{
          mx: 1,
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
              setSelectedUsers([]);
              setSelectedSection(v);
              setStudents(null);
            }}
          />
        )}
        {/* {selectedSection && <ButtonWrapper handleClick={handleStudentList}> Find</ButtonWrapper>} */}

        {/* <Grid>
          <ExportData students={students?.AllStudents} />
        </Grid> */}
      </Card>
      <Grid sx={{ px: 1 }} container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
        <Grid item xs={12} sx={{ width: { xs: '100vw', md: '100%' } }}>
          <Results
            query={query}
            setQuery={setQuery}
            selectedItems={selectedItems}
            setSelectedUsers={setSelectedUsers}
            students={students?.AllStudents || []}
            refetch={handleStudentList}
            discount={discount}
            fee={fee}
            idCard={idCard}
          />
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

SeparatedStudentsList.getLayout = (page) => (
  <Authenticated name="student">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default SeparatedStudentsList;
