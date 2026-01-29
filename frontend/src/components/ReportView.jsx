import { useState } from "react";
import reportService from "../services/report.service";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack, Button, Box, Chip, Alert, CircularProgress,
  Card, CardContent, Grid
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrintIcon from '@mui/icons-material/Print';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

const ReportView = () => {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [from, setFrom] = useState(dayjs().subtract(1, 'month'));
  const [to, setTo] = useState(dayjs());

  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return "-";
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  // Cargar reporte de préstamos activos
  const loadActive = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reportService.activeLoans(
        from.startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        to.endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      );
      setData(res.data || []);
      setTitle("Préstamos Activos");
    } catch (error) {
      setError("Error al cargar préstamos activos");
    } finally {
      setLoading(false);
    }
  };

  // Cargar reporte de herramientas más solicitadas
  const loadTop = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reportService.topTools(
        from.startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        to.endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      );
      
      const formattedData = Array.isArray(res.data) 
        ? res.data.map(item => ({
            id: item.toolGroupId,
            toolGroupName: item.toolGroupName,
            total: item.total,
            category: item.category || "Sin categoría"
          })).sort((a, b) => b.total - a.total)
        : [];
      
      setData(formattedData);
      setTitle("Herramientas Más Solicitadas");
    } catch (error) {
      setError("Error al cargar ranking de herramientas");
    } finally {
      setLoading(false);
    }
  };

  // Cargar reporte de clientes con deudas
  const loadCustomersWithDebt = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await reportService.customersWithDebt();
      
      if (!res.data || res.data.length === 0) {
        setData([]);
        setTitle("Clientes con deudas (0 encontrados)");
      } else {
        setData(res.data);
        setTitle("Clientes con Deudas Pendientes");
      }
    } catch (error) {
      setError("Error al cargar clientes con deudas");
    } finally {
      setLoading(false);
    }
  };

  // Limpiar filtros y datos
  const clearAll = () => {
    setData([]);
    setTitle("");
    setFrom(dayjs().subtract(1, 'month'));
    setTo(dayjs());
    setError("");
  };

  // Formato de moneda
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "$0";
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  // Renderizar tabla según el tipo de reporte
  const renderTable = () => {
    if (data.length === 0) return null;

    const lowerTitle = title.toLowerCase();

    // Tabla de herramientas más solicitadas
    if (lowerTitle.includes("herramientas") && lowerTitle.includes("solicitadas")) {
      const totalAll = data.reduce((sum, r) => sum + (r.total || 0), 0);
      
      return (
        <TableContainer sx={{ maxHeight: '60vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ 
                '& th': { 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }
              }}>
                <TableCell width="150px">N°</TableCell>
                <TableCell>Herramienta</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell width="200px">N° Solicitudes</TableCell>
                <TableCell width="100px">Porcentaje</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {data.map((row, index) => {
                const percentage = totalAll > 0 ? Math.round((row.total / totalAll) * 100) : 0;
                
                return (
                  <TableRow 
                    key={index} 
                    hover 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f0ff' },
                      '&:nth-of-type(even)': { backgroundColor: '#fafafa' }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: index < 3 ? '#ffeb3b' : '#f5f5f5', 
                        width: 30, 
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                      }}>
                        {index + 1}
                      </Box>
                    </TableCell>
                    
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {row.toolGroupName}
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={row.category} 
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: '#e3f2fd', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1,
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontWeight: 'bold'
                      }}>
                        {row.total}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold',
                        color: percentage > 50 ? '#2e7d32' : '#1976d2'
                      }}>
                        {percentage}%
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Tabla de préstamos activos
    if (lowerTitle.includes("préstamos") && lowerTitle.includes("activos")) {
      return (
        <TableContainer sx={{ maxHeight: '60vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ 
                '& th': { 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }
              }}>
                <TableCell>Cliente</TableCell>
                <TableCell>Herramienta</TableCell>
                <TableCell width="250px">Fecha Préstamo</TableCell>
                <TableCell width="200px">Fecha Devolución</TableCell>
                <TableCell width="100px">Estado</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index} 
                  hover 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f0ff' },
                    '&:nth-of-type(even)': { backgroundColor: '#fafafa' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'medium' }}>
                    {row.customerName || 'Sin nombre'}
                  </TableCell>
                  <TableCell>
                    {row.toolName || 'Sin herramienta'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {formatDate(row.loanDate)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                    {formatDate(row.dueDate)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status || 'SIN ESTADO'} 
                      size="small"
                      sx={{
                        backgroundColor: 
                          row.status === 'ACTIVE' ? '#4caf50' :
                          row.status === 'OVERDUE' ? '#f44336' : '#ff9800',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem'
                      }}
                      icon={row.status === 'ACTIVE' ? <CheckCircleIcon /> : <ErrorIcon />}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Tabla de clientes con deudas
    if (lowerTitle.includes("clientes") && lowerTitle.includes("deudas")) {
      return (
        <TableContainer sx={{ maxHeight: '60vh' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ 
                '& th': { 
                  backgroundColor: '#6c63ff', 
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }
              }}>
                <TableCell>Nombre</TableCell>
                <TableCell>RUT</TableCell>
                <TableCell>Email</TableCell>
                <TableCell width="150px">Deuda Total</TableCell>
                <TableCell width="100px">¿Atraso?</TableCell>
                <TableCell width="130px">Fecha más antigua</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {data.map((row, index) => {
                const hasOverdue = row.hasOverdueLoan === true || row.hasOverdueLoan === 'Sí';
                const totalDebt = row.totalDebt || 0;
                
                return (
                  <TableRow 
                    key={index} 
                    hover 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f0ff' },
                      '&:nth-of-type(even)': { backgroundColor: '#fafafa' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {row.name || 'Sin nombre'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {row.rut || 'Sin RUT'}
                    </TableCell>
                    <TableCell>
                      {row.email || 'Sin email'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: '#ffebee', 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 1,
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        color: '#d32f2f'
                      }}>
                        {formatCurrency(totalDebt)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={hasOverdue ? 'Sí' : 'No'} 
                        size="small"
                        color={hasOverdue ? 'error' : 'success'}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {formatShortDate(row.oldestDueDate)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return null;
  };

  const showResults = !loading && data.length > 0;

  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon /> Reportes y Estadísticas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Genera reportes de préstamos, clientes y herramientas
          </Typography>
        </Box>
        <Button 
          startIcon={<RefreshIcon />}
          onClick={clearAll}
          variant="outlined"
          size="small"
        >
          Limpiar
        </Button>
      </Box>

      {/* Filtros de fecha */}
      <Card sx={{ mb: 3, backgroundColor: '#f8f9ff' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CalendarMonthIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Filtros de Fecha
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
              Aplican para "Préstamos Activos" y "Top Herramientas"
            </Typography>
          </Box>
          
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-end">
              <DatePicker
                label="Desde"
                value={from}
                onChange={(newVal) => setFrom(newVal ?? dayjs())}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    sx: { minWidth: 200 }
                  } 
                }}
              />
              <DatePicker
                label="Hasta"
                value={to}
                onChange={(newVal) => setTo(newVal ?? dayjs())}
                slotProps={{ 
                  textField: { 
                    size: 'small',
                    sx: { minWidth: 200 }
                  } 
                }}
              />
            </Stack>
          </LocalizationProvider>
        </CardContent>
      </Card>

      {/* Botones de reportes */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
            }}
            onClick={loadActive}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <LocalActivityIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 0.5 }}>Préstamos Activos</Typography>
              <Typography variant="body2" color="text.secondary">
                Ver préstamos en curso por período
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
            }}
            onClick={loadCustomersWithDebt}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <PeopleIcon sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 0.5 }}>Clientes con Deudas</Typography>
              <Typography variant="body2" color="text.secondary">
                Clientes con pagos pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
            }}
            onClick={loadTop}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#2e7d32', mb: 1 }} />
              <Typography variant="h6" sx={{ mb: 0.5 }}>Top Herramientas</Typography>
              <Typography variant="body2" color="text.secondary">
                Herramientas más solicitadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Errores */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Cargando reporte...</Typography>
        </Box>
      )}

      {/* Tabla de datos */}
      {showResults && (
        <Card sx={{ border: '1px solid #e0e0e0' }}>
          <CardContent>
            {/* Título del reporte */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3,
              pb: 2,
              borderBottom: '1px solid #e0e0e0'
            }}>
              <Typography variant="h5" sx={{ color: '#6c63ff' }}>
                {title}
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<PrintIcon />}
                onClick={() => window.print()}
                size="small"
              >
                Imprimir
              </Button>
            </Box>

            {renderTable()}

            {/* Pie de tabla */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid #e0e0e0' 
            }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {data.length} registros
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generado el {dayjs().format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Sin datos */}
      {!loading && title && data.length === 0 && (
        <Card sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: '#fafafa',
          border: '1px dashed #e0e0e0'
        }}>
          <CardContent>
            <Box sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }}>
              {title.includes("Préstamos") && <LocalActivityIcon fontSize="inherit" />}
              {title.includes("Clientes") && <PeopleIcon fontSize="inherit" />}
              {title.includes("Herramientas") && <TrendingUpIcon fontSize="inherit" />}
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No hay datos para mostrar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No se encontraron registros con los criterios actuales
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Estado inicial */}
      {!loading && !title && data.length === 0 && (
        <Card sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: '#fafafa',
          border: '1px dashed #e0e0e0'
        }}>
          <CardContent>
            <Box sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }}>
              <TrendingUpIcon fontSize="inherit" />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Selecciona un reporte
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Haz clic en una de las tarjetas de arriba para generar un reporte
            </Typography>
          </CardContent>
        </Card>
      )}
    </Paper>
  );
};

export default ReportView;