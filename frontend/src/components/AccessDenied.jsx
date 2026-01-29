// src/components/AccessDenied.jsx
import { Box, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied({ userRole, requiredRoles }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        p: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 2,
          backgroundColor: '#ffffff'
        }}
      >
        <LockIcon 
          sx={{ 
            fontSize: 80, 
            color: '#6c63ff',
            mb: 2,
            opacity: 0.8
          }} 
        />
        
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 'bold',
          color: '#333',
          mb: 2
        }}>
          Acceso Restringido
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 3 }}>
          Esta sección requiere permisos específicos que no están asignados a tu cuenta.
        </Typography>

        <Box 
          sx={{ 
            backgroundColor: '#f8f9ff', 
            p: 2, 
            borderRadius: 1, 
            mb: 3,
            textAlign: 'left',
            border: '1px solid #e0e0e0'
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Tu rol actual:</strong> 
            <span style={{ 
              color: userRole === 'ADMIN' ? '#6c63ff' : '#1976d2',
              marginLeft: '8px',
              fontWeight: 'bold'
            }}>
              {userRole || 'No asignado'}
            </span>
          </Typography>
          <Typography variant="body2">
            <strong>Roles requeridos:</strong> 
            <span style={{ 
              color: '#6c63ff',
              marginLeft: '8px',
              fontWeight: 'bold'
            }}>
              {requiredRoles.join(', ')}
            </span>
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          flexWrap: 'wrap' 
        }}>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/home')}
            sx={{ 
              borderRadius: 2,
              backgroundColor: '#6c63ff',
              '&:hover': {
                backgroundColor: '#5a52d5'
              }
            }}
          >
            Ir al Inicio
          </Button>
          
          {userRole === "EMPLOYEE" && (
            <Button
              variant="outlined"
              onClick={() => navigate('/loans')}
              sx={{ 
                borderRadius: 2,
                borderColor: '#6c63ff',
                color: '#6c63ff',
                '&:hover': {
                  borderColor: '#5a52d5',
                  backgroundColor: 'rgba(108, 99, 255, 0.04)'
                }
              }}
            >
              Ir a Préstamos
            </Button>
          )}
          
          {userRole === "ADMIN" && (
            <Button
              variant="outlined"
              onClick={() => navigate('/customers')}
              sx={{ 
                borderRadius: 2,
                borderColor: '#6c63ff',
                color: '#6c63ff',
                '&:hover': {
                  borderColor: '#5a52d5',
                  backgroundColor: 'rgba(108, 99, 255, 0.04)'
                }
              }}
            >
              Ir a Clientes
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}