'use client';
import React from 'react';
import { SnackbarProvider } from 'notistack';

const NotificationProvider = ({ children }) => {

    return (
        <>
            <SnackbarProvider
                maxSnack={6}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right'
                }}
            >
                {children}
            </SnackbarProvider>
        </>
    );
};

export default NotificationProvider;
