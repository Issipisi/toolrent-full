import { Box, Typography, Paper, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const NotFound = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper
        sx={{
          p: 5,
          textAlign: "center",
          borderRadius: 2,
          background: "#ffffff",
          boxShadow: "0 8px 24px rgba(108, 99, 255, 0.1)"
        }}
      >
        {/* Icono */}
        <Box sx={{ mb: 3 }}>
          <ErrorOutlineIcon 
            sx={{ 
              fontSize: 80, 
              color: "#f44336",
              opacity: 0.8 
            }} 
          />
        </Box>

        {/* Título */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            mb: 2,
            color: "#6c63ff"
          }}
        >
          404 - Página No Encontrada
        </Typography>

        {/* Mensaje */}
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          La página que estás buscando no existe o no está disponible en este momento.
        </Typography>

        {/* Botones de acción */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/home"
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{
              background: "#6c63ff",
              px: 4,
              py: 1,
              borderRadius: 2,
              "&:hover": { background: "#5a52d5" }
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
              py: 1,
              borderRadius: 2,
              borderColor: "#6c63ff",
              color: "#6c63ff",
              "&:hover": {
                borderColor: "#5a52d5",
                backgroundColor: "#f0f4ff"
              }
            }}
          >
            Volver Atrás
          </Button>
        </Box>

        {/* Información adicional */}
        <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid #e0e0e0" }}>
          <Typography variant="body2" color="text.secondary">
            ToolRent • Sistema de Gestión de Herramientas
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Si el problema persiste, contacta al administrador del sistema.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound;