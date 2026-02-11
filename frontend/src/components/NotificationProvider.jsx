// src/components/NotificationProvider.jsx - VERSIÓN MEJORADA
import { Snackbar, Alert, IconButton } from "@mui/material";
import { createContext, useContext, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
    duration: 3000
  });

  const showNotification = (message, severity = "success", duration = 3000) => {
    setNotification({
      open: true,
      message,
      severity,
      duration
    });
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={notification.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          '& .MuiAlert-root': {
            fontSize: '1rem',
            fontWeight: 500
          }
        }}
      >
        <Alert 
          onClose={handleClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%', minWidth: '300px' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};