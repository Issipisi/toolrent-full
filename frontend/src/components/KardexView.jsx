import { useEffect, useState } from "react";
import kardexService from "../services/kardex.service";
import toolGroupService from "../services/toolGroup.service";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
  Box,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Alert
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FilterListIcon from '@mui/icons-material/FilterList';
import HistoryIcon from '@mui/icons-material/History';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const KardexView = () => {
  /* ---------- ESTADOS ---------- */
  const [rows, setRows] = useState([]);
  const [tools, setTools] = useState([]);
  const [selectedTool, setSelectedTool] = useState("");
  const [from, setFrom] = useState(dayjs().subtract(1, 'month'));
  const [to, setTo] = useState(dayjs());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movementTypes] = useState([
    { value: 'ALL', label: 'Todos los tipos' },
    { value: 'REGISTRY', label: 'Registro' },
    { value: 'LOAN', label: 'Préstamo' },
    { value: 'RETURN', label: 'Devolución' },
    { value: 'REPAIR', label: 'Reparación' },
    { value: 'RETIRE', label: 'Baja' },
    { value: 'RE_ENTRY', label: 'Reingreso' }
  ]);
  const [selectedType, setSelectedType] = useState('ALL');

  /* ---------- CARGAS INICIALES ---------- */
  useEffect(() => {
    loadAllMovements();
    loadTools();
  }, []);

  const loadAllMovements = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await kardexService.getAll();
      const data = res.data || res; // Compatible con ambos formatos
      // ORDENAR por fecha descendente (más reciente primero)
      const sortedData = data.sort((a, b) => 
        new Date(b.movementDate || b.date || b.createdAt) - new Date(a.movementDate || a.date || a.createdAt)
      );
      setRows(sortedData);
    } catch (error) {
      setError("Error cargando movimientos del kárdex");
      console.error("Error loading kardex movements:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async () => {
    try {
      const res = await toolGroupService.getAll();
      const data = res.data || res; // Compatible con ambos formatos
      setTools(data);
    } catch (error) {
      console.error("Error loading tools:", error);
    }
  };

  /* ---------- FILTROS ---------- */
  const applyFilters = async () => {
    setLoading(true);
    setError("");
    
    try {
      let filteredData = [];
      
      // Primero filtro por herramienta si está seleccionada
      if (selectedTool) {
        const res = await kardexService.byTool(selectedTool);
        filteredData = res.data || res;
      } else {
        // Si no hay herramienta seleccionada, traer todos
        const res = await kardexService.getAll();
        filteredData = res.data || res;
      }
      
      // Luego filtro por rango de fechas
      if (from && to) {
        filteredData = filteredData.filter(item => {
          const itemDate = new Date(item.movementDate || item.date || item.createdAt);
          const fromDate = new Date(from);
          const toDate = new Date(to);
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);
          return itemDate >= fromDate && itemDate <= toDate;
        });
      }
      
      // Filtrar por tipo si no es "ALL"
      if (selectedType !== 'ALL') {
        filteredData = filteredData.filter(item => 
          item.movementType === selectedType
        );
      }
      
      // Ordenar por fecha descendente
      const sortedData = filteredData.sort((a, b) => 
        new Date(b.movementDate || b.date || b.createdAt) - new Date(a.movementDate || a.date || a.createdAt)
      );
      
      setRows(sortedData);
    } catch (error) {
      setError("Error aplicando filtros");
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedTool("");
    setSelectedType("ALL");
    setFrom(dayjs().subtract(1, 'month'));
    setTo(dayjs());
    loadAllMovements();
  };

  // Función para formatear fecha
  const formatDateTime = (dateString) => {
    if (!dateString) return "Sin fecha";
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Función para colores según tipo de movimiento
  const getMovementTypeColor = (type) => {
    const colors = {
      'REGISTRY': 'success',
      'LOAN': 'info',
      'RETURN': 'primary',
      'REPAIR': 'warning',
      'RETIRE': 'error',
      'RE_ENTRY': 'success',
      'ENTRY': 'success',
      'OUT': 'error'
    };
    return colors[type] || 'default';
  };

  // Traducir tipo de movimiento
  const translateMovementType = (type) => {
    const translations = {
      'REGISTRY': 'Registro',
      'LOAN': 'Préstamo',
      'RETURN': 'Devolución',
      'REPAIR': 'Reparación',
      'RETIRE': 'Baja',
      'RE_ENTRY': 'Reingreso',
      'ENTRY': 'Entrada',
      'OUT': 'Salida'
    };
    return translations[type] || type;
  };

  // Estadísticas
  const stats = {
    total: rows.length,
    loans: rows.filter(r => r.movementType === 'LOAN').length,
    returns: rows.filter(r => r.movementType === 'RETURN').length,
    today: rows.filter(r => 
      dayjs(r.movementDate).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    ).length
  };

  /* ---------- RENDER ---------- */
  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon /> Kárdex de Movimientos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Registro histórico de todas las transacciones del sistema
          </Typography>
        </Box>
        <Button 
          startIcon={<RefreshIcon />}
          onClick={loadAllMovements}
          disabled={loading}
          variant="outlined"
        >
          Actualizar
        </Button>
      </Box>

      {/* Mensajes de error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 3}}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Movimientos Totales</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3}}>
          <Card sx={{ borderLeft: '4px solid #2196f3' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#2196f3" }}>
                {stats.loans}
              </Typography>
              <Typography variant="body2" color="text.secondary">Préstamos</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3}}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#4caf50" }}>
                {stats.returns}
              </Typography>
              <Typography variant="body2" color="text.secondary">Devoluciones</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3}}>
          <Card sx={{ borderLeft: '4px solid #ff9800' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#ff9800" }}>
                {stats.today}
              </Typography>
              <Typography variant="body2" color="text.secondary">Hoy</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ---------- FILTROS ---------- */}
      <Card sx={{ mb: 3, backgroundColor: '#f8f9ff' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterListIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Filtros Avanzados
            </Typography>
          </Box>
          
          <Grid container spacing={2} alignItems="flex-end">
            {/* Filtro por herramienta */}
            <Grid size={{ xs: 12, md: 3}}>
              <TextField
                select
                fullWidth
                label="Herramienta"
                value={selectedTool}
                onChange={(e) => setSelectedTool(e.target.value)}
                size="small"
              >
                <MenuItem value="">Todas las herramientas</MenuItem>
                {tools.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} ({t.category})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Filtro por tipo */}
            <Grid size={{ xs: 12, md: 2}}>
              <TextField
                select
                fullWidth
                label="Tipo de Movimiento"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                size="small"
              >
                {movementTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Filtro por fechas */}
            <Grid size={{ xs: 12, md: 4}}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthIcon color="action" fontSize="small" />
                  <DatePicker
                    label="Desde"
                    value={from}
                    onChange={(newVal) => setFrom(newVal ?? dayjs())}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        sx: { flex: 1 }
                      } 
                    }}
                  />
                  <Typography variant="body2">hasta</Typography>
                  <DatePicker
                    label="Hasta"
                    value={to}
                    onChange={(newVal) => setTo(newVal ?? dayjs())}
                    slotProps={{ 
                      textField: { 
                        size: 'small',
                        sx: { flex: 1 }
                      } 
                    }}
                  />
                </Stack>
              </LocalizationProvider>
            </Grid>

            {/* Botones de acción */}
            <Grid size={{ xs: 12, md: 3}}>
              <Stack direction="row" spacing={1}>
                <Button 
                  variant="contained" 
                  onClick={applyFilters}
                  startIcon={<SearchIcon />}
                  size="small"
                  fullWidth
                >
                  Aplicar Filtros
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={clearFilters}
                  size="small"
                  fullWidth
                >
                  Limpiar
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ---------- TABLA ---------- */}
      <TableContainer sx={{ maxHeight: '60vh', borderRadius: 1, border: '1px solid #e0e0e0' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ 
              '& th': { 
                backgroundColor: '#6c63ff', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                borderBottom: '2px solid #5a52d5'
              }
            }}>
              <TableCell width="80px"># ID</TableCell>
              <TableCell width="150px">Fecha y Hora</TableCell>
              <TableCell width="120px">Tipo</TableCell>
              <TableCell>Herramienta</TableCell>
              <TableCell>Cliente/Usuario</TableCell>
              <TableCell>Detalles</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography sx={{ mt: 1 }}>Cargando movimientos...</Typography>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No hay movimientos registrados con los filtros actuales
                  </Typography>
                  <Button 
                    onClick={clearFilters} 
                    sx={{ mt: 1 }}
                    size="small"
                  >
                    Ver todos los movimientos
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow 
                  key={row.id} 
                  hover 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f0ff' },
                    '&:nth-of-type(even)': { backgroundColor: '#fafafa' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {row.id}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {formatDateTime(row.movementDate || row.date || row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={translateMovementType(row.movementType || row.type)} 
                      size="small"
                      sx={{
                        backgroundColor: 
                          row.movementType === 'LOAN' ? '#2196f3' :
                          row.movementType === 'RETURN' ? '#4caf50' :
                          row.movementType === 'REGISTRY' ? '#9c27b0' :
                          row.movementType === 'REPAIR' ? '#ff9800' :
                          row.movementType === 'RETIRE' ? '#f44336' : '#757575',
                        color: 'white',
                        fontWeight: 'bold',
                        minWidth: 100,
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {row.toolUnit?.toolGroup?.name || row.toolGroupName || 'Herramienta no especificada'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.toolUnit?.id ? `ID: ${row.toolUnit.id}` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ 
                      backgroundColor: '#e8f5e9', 
                      px: 1.5, 
                      py: 0.5, 
                      borderRadius: 1,
                      display: 'inline-block',
                      fontSize: '0.85rem'
                    }}>
                      {row.customer?.name || row.userName || 'Sistema'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 300
                      }}
                      title={row.details || 'Sin detalles'}
                    >
                      {row.details || 'Sin detalles adicionales'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pie de tabla */}
      {!loading && rows.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 2, 
          pt: 2, 
          borderTop: '1px solid #e0e0e0' 
        }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {rows.length} movimientos
            {selectedTool && ` - Herramienta filtrada`}
            {selectedType !== 'ALL' && ` - Tipo: ${selectedType}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Generado el {dayjs().format('DD/MM/YYYY HH:mm')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default KardexView;