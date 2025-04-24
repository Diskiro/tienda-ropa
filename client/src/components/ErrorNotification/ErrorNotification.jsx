import React, { useState, useEffect } from 'react';
import { Error as ErrorIcon } from '@mui/icons-material';
import { Alert, Snackbar } from '@mui/material';

const ErrorNotification = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    if (!isVisible) return null;

    return (
        <Snackbar
            open={isVisible}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ 
                '& .MuiAlert-root': {
                    backgroundColor: '#ffebee',
                    color: '#d32f2f',
                    '& .MuiAlert-icon': {
                        color: '#d32f2f'
                    }
                }
            }}
        >
            <Alert 
                severity="error" 
                icon={<ErrorIcon />}
                onClose={() => {
                    setIsVisible(false);
                    onClose();
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default ErrorNotification; 