'use client';
import React from 'react';
import { SnackbarProvider } from 'notistack';
import Scholarship from "@/components/scholarship/Scholarship";

const ScholarshipMain = ({
    classes,
    academicYears,
    serverHost,
    studentAdmissionForm,
    school
}) => {

    return (
        <>
            <SnackbarProvider
                maxSnack={6}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
            >
                <Scholarship
                    classes={classes}
                    academicYears={academicYears}
                    serverHost={serverHost}
                    studentAdmissionForm={studentAdmissionForm}
                    school={school}
                />
            </SnackbarProvider>
        </>
    );
};

export default ScholarshipMain;
