import { Box, Typography, Paper, Button, Container, Fade } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchOffIcon from "@mui/icons-material/SearchOff";

const NotFound = () => {
  // Obtener la URL que intentó acceder
  const currentPath = window.location.pathname;

  return (
    <Fade in={true} timeout={800}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 5 },
            textAlign: "center",
            borderRadius: 3,
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
            boxShadow: "0 12px 40px rgba(108, 99, 255, 0.15)",
            border: "1px solid rgba(108, 99, 255, 0.1)",
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #6c63ff 0%, #9d4edd 100%)',
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          {/* Icono animado */}
          <Box sx={{ 
            mb: 3,
            animation: 'pulse 2s infinite ease-in-out',
            '@keyframes pulse': {
              '0%': { opacity: 0.8, transform: 'scale(1)' },
              '50%': { opacity: 1, transform: 'scale(1.05)' },
              '100%': { opacity: 0.8, transform: 'scale(1)' }
            }
          }}>
            <Box sx={{ 
              display: 'inline-flex',
              p: 2,
              borderRadius: '50%',
              backgroundColor: 'rgba(244, 67, 54, 0.1)'
            }}>
              <SearchOffIcon 
                sx={{ 
                  fontSize: 80, 
                  color: "#f44336"
                }} 
              />
            </Box>
          </Box>

          {/* Código de error */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: "bold",
              mb: 1,
              background: "linear-gradient(90deg, #f44336 0%, #ff9800 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: { xs: '4rem', sm: '5rem' }
            }}
          >
            404
          </Typography>

          {/* Título */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 2,
              color: "#333"
            }}
          >
            Página No Encontrada
          </Typography>

          {/* Mensaje personalizado */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            La página que intentaste acceder no existe o fue movida.
            <br />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666' }}>
              <strong>URL:</strong> {currentPath}
            </Typography>
          </Typography>

          {/* Posibles causas */}
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 4, 
              backgroundColor: '#f8f9ff',
              borderRadius: 2,
              textAlign: 'left',
              maxWidth: '500px',
              mx: 'auto'
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#6c63ff' }}>
              ¿Qué pudo haber pasado?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • La URL puede contener un error de escritura
              <br />
              • La página pudo haber sido eliminada o movida
              <br />
              • Es posible que no tengas permisos para acceder
              <br />
              • Puede ser un enlace temporalmente deshabilitado
            </Typography>
          </Paper>

          {/* Botones de acción */}
          <Box sx={{ 
            display: "flex", 
            gap: 2, 
            justifyContent: "center", 
            flexWrap: 'wrap',
            mb: 4 
          }}>
            <Button
              component={Link}
              to="/home"
              variant="contained"
              startIcon={<HomeIcon />}
              sx={{
                background: "linear-gradient(135deg, #6c63ff 0%, #9d4edd 100%)",
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 'bold',
                "&:hover": { 
                  background: "linear-gradient(135deg, #5a52d5 0%, #8b3dd1 100%)",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(108, 99, 255, 0.3)'
                },
                transition: 'all 0.2s'
              }}
            >
              Ir al Inicio
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => window.history.back()}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 'bold',
                borderColor: "#6c63ff",
                color: "#6c63ff",
                "&:hover": {
                  borderColor: "#5a52d5",
                  backgroundColor: "#f0f4ff",
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(108, 99, 255, 0.1)'
                },
                transition: 'all 0.2s'
              }}
            >
              Volver Atrás
            </Button>

            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{
                px: 4,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 'bold',
                borderColor: "#4caf50",
                color: "#4caf50",
                "&:hover": {
                  borderColor: "#388e3c",
                  backgroundColor: "#e8f5e9",
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s'
              }}
            >
              Recargar Página
            </Button>
          </Box>

          {/* Información adicional */}
          <Box sx={{ 
            mt: 4, 
            pt: 3, 
            borderTop: "1px solid rgba(224, 224, 224, 0.5)" 
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>ToolRent • Sistema de Gestión de Herramientas</strong>
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Si el problema persiste, contacta al administrador del sistema o reporta el error.
            </Typography>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Versión: 1.0.0
              </Typography>
              <Typography variant="caption" color="text.secondary">
                •
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date().toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Fade>
  );
};

export default NotFound;