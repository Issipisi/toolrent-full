import React, { useEffect, useState } from "react";
import toolUnitService from "../services/toolUnit.service";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Button, Box, Chip,
  Grid, Card, CardContent, Alert
} from "@mui/material";
import BuildIcon from '@mui/icons-material/Build';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

const ToolUnitView = () => {
  const [units, setUnits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [toolNames, setToolNames] = useState([]);
  const [selectedTool, setSelectedTool] = useState("Todas");
  const [openRepair, setOpenRepair] = useState(false);
  const [openRetire, setOpenRetire] = useState(false);
  const [openResolve, setOpenResolve] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  /* ---------- Carga inicial (MANTIENE tu lógica original) ---------- */
  const loadUnits = async () => {
    setLoading(true);
    try {
      const res = await toolUnitService.getAllWithDetails(); // Tu método original
      console.log("Unidades cargadas:", res.data);
      setUnits(res.data || []);

      // Mantiene tu lógica de extracción de nombres únicos
      const names = Array.from(new Set(res.data.map(u => u.toolGroup?.name).filter(Boolean))).sort();
      setToolNames(names);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cargando unidades' });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Filtro por herramienta seleccionada (MANTIENE tu lógica) ---------- */
  useEffect(() => {
    if (selectedTool === "Todas") {
      setFiltered(units);
    } else {
      setFiltered(units.filter(u => u.toolGroup?.name === selectedTool));
    }
  }, [selectedTool, units]);

  /* ---------- Handlers (MANTIENE tus funciones originales) ---------- */
  const handleSendToRepair = async () => {
    if (!selectedUnit) return;
    try {
      // Tu función original
      await toolUnitService.changeStatus(selectedUnit.id, "EN_REPARACION");
      setMessage({ type: 'success', text: 'Herramienta enviada a reparación' });
      setOpenRepair(false);
      loadUnits();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error enviando a reparación' });
    }
  };

  const handleRetire = async () => {
    if (!selectedUnit) return;
    try {
      // Tu función original
      await toolUnitService.changeStatus(selectedUnit.id, "DADA_DE_BAJA");
      setMessage({ type: 'success', text: 'Herramienta retirada del inventario' });
      setOpenRetire(false);
      loadUnits();
      window.dispatchEvent(new Event("debtUpdated"));
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error retirando herramienta' });
    }
  };

  const handleResolveAvailable = async () => {
    if (!selectedUnit) return;
    try {
      // Tu función original
      await toolUnitService.resolveRepair(selectedUnit.id, false);
      setMessage({ type: 'success', text: 'Herramienta marcada como disponible' });
      setOpenResolve(false);
      loadUnits();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error marcando como disponible' });
    }
  };

  const handleResolveRetire = async () => {
    if (!selectedUnit) return;
    try {
      // Tu función original
      await toolUnitService.retireFromRepair(selectedUnit.id);
      setMessage({ type: 'success', text: 'Herramienta retirada definitivamente' });
      setOpenResolve(false);
      loadUnits();
      window.dispatchEvent(new Event("debtUpdated"));
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error retirando herramienta' });
    }
  };

  /* ---------- Estadísticas mejoradas (NUEVO diseño) ---------- */
  const stats = {
    total: units.length,
    available: units.filter(u => u.status === 'AVAILABLE').length,
    inRepair: units.filter(u => u.status === 'IN_REPAIR' || u.status === 'EN_REPARACION').length,
    loaned: units.filter(u => u.status === 'LOANED').length,
    retired: units.filter(u => u.status === 'RETIRED' || u.status === 'DADA_DE_BAJA').length
  };

  /* ---------- Funciones de ayuda para el diseño (NUEVO) ---------- */
  const getStatusColor = (status) => {
    const colors = {
      'AVAILABLE': 'success',
      'EN_REPARACION': 'warning',
      'IN_REPAIR': 'warning',
      'LOANED': 'info',
      'DADA_DE_BAJA': 'error',
      'RETIRED': 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'AVAILABLE': <CheckCircleIcon fontSize="small" />,
      'EN_REPARACION': <SettingsIcon fontSize="small" />,
      'IN_REPAIR': <SettingsIcon fontSize="small" />,
      'LOANED': <WarningIcon fontSize="small" />,
      'DADA_DE_BAJA': <DeleteForeverIcon fontSize="small" />,
      'RETIRED': <DeleteForeverIcon fontSize="small" />
    };
    return icons[status] || <BuildIcon fontSize="small" />;
  };

  useEffect(() => { loadUnits(); }, []);

  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      {/* ---------- Encabezado mejorado (NUEVO diseño) ---------- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon /> Unidades de Herramientas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión individual de cada herramienta
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={loadUnits}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {/* ---------- Mensajes de estado (NUEVO) ---------- */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* ---------- Tarjetas de estadísticas (NUEVO diseño) ---------- */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={2.4}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.available}
              </Typography>
              <Typography variant="body2" color="text.secondary">Disponibles</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={2.4}>
          <Card sx={{ borderLeft: '4px solid #ff9800' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.inRepair}
              </Typography>
              <Typography variant="body2" color="text.secondary">En Reparación</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={2.4}>
          <Card sx={{ borderLeft: '4px solid #2196f3' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stats.loaned}
              </Typography>
              <Typography variant="body2" color="text.secondary">En Préstamo</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={2.4}>
          <Card sx={{ borderLeft: '4px solid #f44336' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">
                {stats.retired}
              </Typography>
              <Typography variant="body2" color="text.secondary">Retiradas</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ---------- Sección de filtros mejorada (NUEVO diseño) ---------- */}
      <Box sx={{ 
        p: 2, 
        mb: 3, 
        border: '1px solid #e0e0e0', 
        borderRadius: 2,
        backgroundColor: '#fafafa'
      }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          Filtros
        </Typography>
        
        <FormControl fullWidth>
          <InputLabel>Filtrar por Herramienta</InputLabel>
          <Select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            label="Filtrar por Herramienta"
          >
            <MenuItem value="Todas">Todas las Herramientas</MenuItem>
            {toolNames.map((name) => (
              <MenuItem key={name} value={name}>
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ---------- Tabla mejorada (NUEVO diseño) ---------- */}
      <TableContainer sx={{ maxHeight: '60vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ 
              '& th': { 
                backgroundColor: '#6c63ff', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }
            }}>
              <TableCell>ID</TableCell>
              <TableCell>Herramienta</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  Cargando unidades...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  No hay unidades para mostrar
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((u) => (
                <TableRow 
                  key={u.id} 
                  hover 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f0ff' },
                    '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    #{u.id}
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {u.toolGroup?.name || "—"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(u.status)}
                      <Chip 
                        label={u.status} 
                        size="small"
                        color={getStatusColor(u.status)}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {/* MANTIENE tus condiciones originales */}
                      {(u.status === "IN_REPAIR" || u.status === "EN_REPARACION") && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="info"
                          onClick={() => { setSelectedUnit(u); setOpenResolve(true); }}
                          sx={{ textTransform: 'none' }}
                        >
                          Resolver reparación
                        </Button>
                      )}

                      {u.status === "AVAILABLE" && (
                        <>
                          <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => { setSelectedUnit(u); setOpenRepair(true); }}
                            sx={{ textTransform: 'none' }}
                          >
                            A Reparación
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => { setSelectedUnit(u); setOpenRetire(true); }}
                            sx={{ textTransform: 'none' }}
                          >
                            Retirar
                          </Button>
                        </>
                      )}
                      
                      {(u.status === "LOANED" || u.status === "DADA_DE_BAJA" || u.status === "RETIRED") && (
                        <Typography variant="caption" color="text.secondary">
                          No disponible
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ---------- Pie de tabla (NUEVO) ---------- */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mt: 2, 
        pt: 2, 
        borderTop: '1px solid #e0e0e0' 
      }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {filtered.length} de {units.length} unidades
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Filtrado por: {selectedTool === "Todas" ? "Todas" : selectedTool}
        </Typography>
      </Box>

      {/* ---------- Modales mejorados (NUEVO diseño) ---------- */}
      <Dialog open={openRepair} onClose={() => setOpenRepair(false)} maxWidth="xs">
        <DialogTitle sx={{ background: "#f5f0ff", color: "#6c63ff" }}>
          <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          A Reparación
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography>
              <strong>ID:</strong> {selectedUnit?.id}
            </Typography>
            <Typography>
              <strong>Herramienta:</strong> {selectedUnit?.toolGroup?.name}
            </Typography>
            <Alert severity="warning">
              El estado cambiará a "EN_REPARACIÓN". ¿Continuar?
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRepair(false)}>Cancelar</Button>
          <Button 
            onClick={handleSendToRepair} 
            variant="contained" 
            color="warning"
            startIcon={<SettingsIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openRetire} onClose={() => setOpenRetire(false)} maxWidth="xs">
        <DialogTitle sx={{ background: "#f5f0ff", color: "#6c63ff" }}>
          <DeleteForeverIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Retirar Herramienta
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography>
              <strong>ID:</strong> {selectedUnit?.id}
            </Typography>
            <Typography>
              <strong>Herramienta:</strong> {selectedUnit?.toolGroup?.name || "Sin nombre"}
            </Typography>
            <Alert severity="error">
              La herramienta será "DADA_DE_BAJA". Esta acción no se puede deshacer.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRetire(false)}>Cancelar</Button>
          <Button 
            onClick={handleRetire} 
            variant="contained" 
            color="error"
            startIcon={<DeleteForeverIcon />}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openResolve} onClose={() => setOpenResolve(false)} maxWidth="sm">
        <DialogTitle sx={{ background: "#f5f0ff", color: "#6c63ff" }}>
          <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Resolver Reparación
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography>
              <strong>ID:</strong> {selectedUnit?.id}
            </Typography>
            <Typography>
              <strong>Herramienta:</strong> {selectedUnit?.toolGroup?.name}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              ¿Qué deseas hacer?
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResolve(false)}>Cancelar</Button>
          <Button 
            onClick={handleResolveAvailable} 
            variant="contained" 
            color="success"
            startIcon={<CheckCircleIcon />}
            sx={{ mr: 1 }}
          >
            Marcar como disponible
          </Button>
          <Button 
            onClick={handleResolveRetire} 
            variant="contained" 
            color="error"
            startIcon={<DeleteForeverIcon />}
          >
            Dar de baja definitiva
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ToolUnitView;