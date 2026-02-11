// src/components/ScrollableTable.jsx
import { TableContainer, Box } from "@mui/material";

const ScrollableTable = ({ children, maxHeight = '400px' }) => {
  return (
    <Box sx={{ 
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: '200px',
      position: 'relative'
    }}>
      <TableContainer 
        sx={{ 
          flex: 1,
          maxHeight: maxHeight,
          borderRadius: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555'
          }
        }}
      >
        {children}
      </TableContainer>
    </Box>
  );
};

export default ScrollableTable;