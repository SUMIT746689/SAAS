import { Authenticated } from '@/components/Authenticated';
import ExtendedSidebarLayout from '@/layouts/ExtendedSidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma_client';
import StudentForm from '@/components/Student/StudentForm';
import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'next-i18next';

export const getServerSideProps = async ({ params }) => {
  try {
    const studentID = parseInt(params.id);

    const student = await prisma.student.findUniqueOrThrow({
      where: {
        id: studentID
      },
      include: {
        student_info: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                user_role_id: true,
                role_id: true,
                // "deleted_at": null,
                is_enabled: true,
                // "created_at": "2024-02-08T10:51:48.311Z",
                // "updated_at": "2024-03-10T06:32:41.608Z",
                user_photo: true,
                school_id: true,
                admin_panel_id: true,
              }
            }
          }
        },
        // section: true,
        batches:true,
        extra_section: true,
        subjects:true
      }
    });

    return { props: { student: JSON.parse(JSON.stringify(student)) } };
  } catch (e) {
    return { notFound: true };
  }
};

const EditStudent = ({ student }) => {
  const { t }: { t: any } = useTranslation();
  return (
    <>
      <PageTitleWrapper>
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            {t('Student Edit')}
          </Typography>
          <Typography variant="subtitle2">
            {t(
              `Student name: ${student?.student_info?.first_name} ${
                student?.student_info?.middle_name || ''
              } ${student?.student_info?.last_name || ''}`
            )}
          </Typography>
        </Grid>
      </PageTitleWrapper>

      <StudentForm student={student} />
      <Footer />
    </>
  );
};

EditStudent.getLayout = (page) => (
  <Authenticated name="student">
    <ExtendedSidebarLayout>{page}</ExtendedSidebarLayout>
  </Authenticated>
);

export default EditStudent;
