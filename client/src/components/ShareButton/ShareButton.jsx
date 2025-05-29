import { useState } from 'react';
import { IconButton, Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { Share as ShareIcon, WhatsApp, ContentCopy } from '@mui/icons-material';

const ShareButton = ({ productUrl, productName }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleShare = (platform) => {
        const shareText = `¡Mira este producto en nuestra tienda! ${productName}`;
        let shareUrl = '';

        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`;
                break;
            case 'copy':
                navigator.clipboard.writeText(productUrl);
                setSnackbar({
                    open: true,
                    message: 'Enlace copiado al portapapeles',
                    severity: 'success'
                });
                handleClose();
                return;
            default:
                return;
        }

        try {
            const shareWindow = window.open(shareUrl, '_blank', 'width=600,height=400');
            if (shareWindow) {
                shareWindow.focus();
            } else {
                window.location.href = shareUrl;
            }
        } catch (error) {
            console.error('Error al compartir:', error);
            setSnackbar({
                open: true,
                message: 'Error al compartir. Por favor, intenta de nuevo.',
                severity: 'error'
            });
        }
        handleClose();
    };

    return (
        <>
            <IconButton
                aria-label="compartir"
                onClick={handleClick}
                color="primary"
            >
                <ShareIcon />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={() => handleShare('whatsapp')}>
                    <WhatsApp sx={{ mr: 1 }} /> WhatsApp
                </MenuItem>
                <MenuItem onClick={() => handleShare('copy')}>
                    <ContentCopy sx={{ mr: 1 }} /> Copiar enlace
                </MenuItem>
            </Menu>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ShareButton; 