import { Paper, Box } from "@mui/material";

const BaseLayout = ({ children, maxWidth = "xl", noPadding = false, ariaLabel = "Contenedor principal" }) => {
  return (
    <Box 
      sx={{ 
        width: '100%',
        maxWidth: maxWidth,
        mx: 'auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
      aria-label={ariaLabel}
      role="main"
    >
      <Paper 
        elevation={0} 
        sx={{ 
          p: noPadding ? 0 : { xs: 2, sm: 3, md: 4 },
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {children}
      </Paper>
    </Box>
  );
};

export default BaseLayout;