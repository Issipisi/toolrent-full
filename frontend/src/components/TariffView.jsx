import { useEffect, useState } from "react";
import toolGroupService from "../services/toolGroup.service";
import {
  Paper, TextField, Typography, Stack, MenuItem, Alert,
  Box, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Tooltip, IconButton, FormHelperText, Divider
} from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import { useNotification } from "../components/NotificationProvider";

const TariffView = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGroupData, setSelectedGroupData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Estados del formulario
  const [groupRent, setGroupRent] = useState("");
  const [groupFine, setGroupFine] = useState("");
  const [replacementValue, setReplacementValue] = useState("");
  const [formErrors, setFormErrors] = useState({});
  
  const { showNotification } = useNotification();

  useEffect(() => {
    loadGroups();
  }, []);

  // Cargar grupos
  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await toolGroupService.getAll();
      const data = Array.isArray(res.data) ? res.data : [];
      setGroups(data);
    } catch (error) {
      showNotification("Error cargando grupos de herramientas", "error");
    } finally {
      setLoading(false);
    }
  };

  // Validación de formulario
  const validateForm = () => {
    const errors = {};
    
    // Validar tarifa de alquiler
    if (!groupRent && groupRent !== "0") {
      errors.rent = "Requerido";
    } else {
      const rentNum = parseFloat(groupRent);
      if (isNaN(rentNum)) {
        errors.rent = "Número inválido";
      } else if (rentNum < 0) {
        errors.rent = "No negativo";
      } else if (rentNum > 1000000) {
        errors.rent = "Máx $1M";
      }
    }
    
    // Validar multa diaria
    if (!groupFine && groupFine !== "0") {
      errors.fine = "Requerido";
    } else {
      const fineNum = parseFloat(groupFine);
      if (isNaN(fineNum)) {
        errors.fine = "Número inválido";
      } else if (fineNum < 0) {
        errors.fine = "No negativo";
      } else if (fineNum > 100000) {
        errors.fine = "Máx $100K";
      }
    }
    
    // Validar valor de reposición
    if (!replacementValue && replacementValue !== "0") {
      errors.replacement = "Requerido";
    } else {
      const replacementNum = parseFloat(replacementValue);
      if (isNaN(replacementNum)) {
        errors.replacement = "Número inválido";
      } else if (replacementNum < 0) {
        errors.replacement = "No negativo";
      } else if (replacementNum > 10000000) {
        errors.replacement = "Máx $10M";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar selección de grupo
  const handleGroupSelect = (groupId) => {
    setSelectedGroup(groupId);
    
    if (!groupId) {
      setSelectedGroupData(null);
      setGroupRent("");
      setGroupFine("");
      setReplacementValue("");
      setFormErrors({});
      return;
    }
    
    const g = groups.find((gr) => gr.id === groupId);
    if (!g) {
      showNotification("Grupo no encontrado", "error");
      return;
    }
    
    setSelectedGroupData(g);
    
    // Establecer valores con manejo de undefined
    setGroupRent(g.tariff?.dailyRentalRate?.toString() || "0");
    setGroupFine(g.tariff?.dailyFineRate?.toString() || "0");
    setReplacementValue(g.replacementValue?.toString() || "0");
    setFormErrors({});
  };

  // Guardar tarifas
  const saveGroupTariff = async () => {
    if (!selectedGroup) {
      showNotification("Selecciona un grupo primero", "warning");
      return;
    }

    if (!validateForm()) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }
    
    setSaving(true);
    try {
      await toolGroupService.updateTariff(
        selectedGroup, 
        parseFloat(groupRent), 
        parseFloat(groupFine)
      );
      showNotification("Tarifa actualizada", "success");
      
      await loadGroups();
      handleGroupSelect(selectedGroup);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      showNotification(`Error: ${errorMsg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Guardar valor de reposición
  const saveReplacementValue = async () => {
    if (!selectedGroup) {
      showNotification("Selecciona un grupo primero", "warning");
      return;
    }

    if (!validateForm()) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }
    
    setSaving(true);
    try {
      await toolGroupService.updateReplacementValue(
        selectedGroup, 
        parseFloat(replacementValue)
      );
      showNotification("Reposición actualizada", "success");
      
      await loadGroups();
      handleGroupSelect(selectedGroup);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      showNotification(`Error: ${errorMsg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Actualizar todo
  const handleUpdateAll = async () => {
    if (!selectedGroup) {
      showNotification("Selecciona un grupo primero", "warning");
      return;
    }

    if (!validateForm()) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }
    
    setSaving(true);
    try {
      await Promise.all([
        toolGroupService.updateTariff(
          selectedGroup, 
          parseFloat(groupRent), 
          parseFloat(groupFine)
        ),
        toolGroupService.updateReplacementValue(
          selectedGroup, 
          parseFloat(replacementValue)
        )
      ]);
      
      showNotification("Todas las tarifas actualizadas", "success");
      await loadGroups();
      handleGroupSelect(selectedGroup);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      showNotification(`Error: ${errorMsg}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // Estadísticas
  const stats = {
    totalGroups: groups.length,
    avgRentalRate: groups.length > 0 
      ? groups.reduce((sum, g) => sum + (g.tariff?.dailyRentalRate || 0), 0) / groups.length 
      : 0,
    avgReplacement: groups.length > 0 
      ? groups.reduce((sum, g) => sum + (g.replacementValue || 0), 0) / groups.length 
      : 0,
    completeGroups: groups.filter(g => g.tariff?.dailyRentalRate && g.tariff?.dailyFineRate && g.replacementValue).length
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toLocaleString()}`;
  };

  return (
    <Paper sx={{ 
      p: { xs: 2, md: 3 }, 
      background: "#ffffff",
      minHeight: 'calc(100vh - 100px)'
    }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            <AttachMoneyIcon /> Tarifas
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '600px' }}>
            Configura tarifas por grupo de herramientas. Haz clic en una fila para editar.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip 
            label={`${stats.completeGroups}/${stats.totalGroups} completos`}
            color={stats.completeGroups === stats.totalGroups ? "success" : "warning"}
            size="small"
          />
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={loadGroups}
            disabled={loading || saving}
            size="small"
            sx={{ minWidth: '100px' }}
          >
            {loading ? "Cargando..." : "Actualizar"}
          </Button>
        </Box>
      </Box>

      {/* Vista principal - FORMULARIO MÁS ANGOSTO */}
      <Grid container spacing={3}>
        {/* Columna izquierda: Tabla de resumen (más ancha) */}
        <Grid item xs={12} md={16}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.1rem' }}>
                  <TrendingUpIcon /> Lista de Tarifas
                </Typography>
                <Tooltip title="Haz clic en una fila para editar">
                  <Chip 
                    label={`${groups.length} grupos`} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Tooltip>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : groups.length === 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, py: 4 }}>
                  <BuildIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                  <Typography color="text.secondary">No hay grupos de herramientas</Typography>
                </Box>
              ) : (
                <>
                  <TableContainer sx={{ flex: 1 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow sx={{ 
                          '& th': { 
                            backgroundColor: '#6c63ff', 
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            py: 1
                          }
                        }}>
                          <TableCell sx={{ width: '40%' }}>Herramienta</TableCell>
                          <TableCell align="right" sx={{ width: '15%' }}>Alquiler/Día</TableCell>
                          <TableCell align="right" sx={{ width: '15%' }}>Multa/Día</TableCell>
                          <TableCell align="right" sx={{ width: '20%' }}>Reposición</TableCell>
                          <TableCell align="center" sx={{ width: '10%' }}>Estado</TableCell>
                        </TableRow>
                      </TableHead>
                      
                      <TableBody>
                        {groups.map((g) => {
                          const isSelected = g.id.toString() === selectedGroup;
                          const hasCompleteData = g.tariff?.dailyRentalRate && 
                                                  g.tariff?.dailyFineRate && 
                                                  g.replacementValue;
                          
                          return (
                            <TableRow 
                              key={g.id} 
                              hover 
                              selected={isSelected}
                              onClick={() => handleGroupSelect(g.id)}
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#f5f0ff' },
                                '&.Mui-selected': { backgroundColor: '#e8e1ff' },
                                opacity: hasCompleteData ? 1 : 0.8,
                                '& td': { py: 1 }
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <BuildIcon fontSize="small" color={isSelected ? "primary" : "action"} />
                                  <Box sx={{ overflow: 'hidden' }}>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 'medium',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {g.name}
                                      {!hasCompleteData && (
                                        <WarningIcon fontSize="small" color="warning" sx={{ ml: 0.5, verticalAlign: 'middle' }} />
                                      )}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                      {g.category}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                <Box sx={{ 
                                  backgroundColor: g.tariff?.dailyRentalRate ? '#e8f5e9' : '#ffebee', 
                                  px: 1, 
                                  py: 0.25, 
                                  borderRadius: 0.5,
                                  display: 'inline-block',
                                  fontWeight: 'bold',
                                  color: g.tariff?.dailyRentalRate ? '#2e7d32' : '#d32f2f',
                                  fontSize: '0.8rem'
                                }}>
                                  {g.tariff?.dailyRentalRate ? formatCurrency(g.tariff.dailyRentalRate) : 'N/D'}
                                </Box>
                              </TableCell>
                              
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                <Box sx={{ 
                                  backgroundColor: g.tariff?.dailyFineRate ? '#fff3e0' : '#ffebee', 
                                  px: 1, 
                                  py: 0.25, 
                                  borderRadius: 0.5,
                                  display: 'inline-block',
                                  fontWeight: 'bold',
                                  color: g.tariff?.dailyFineRate ? '#f57c00' : '#d32f2f',
                                  fontSize: '0.8rem'
                                }}>
                                  {g.tariff?.dailyFineRate ? formatCurrency(g.tariff.dailyFineRate) : 'N/D'}
                                </Box>
                              </TableCell>
                              
                              <TableCell align="right" sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                <Box sx={{ 
                                  backgroundColor: g.replacementValue ? '#e3f2fd' : '#ffebee', 
                                  px: 1, 
                                  py: 0.25, 
                                  borderRadius: 0.5,
                                  display: 'inline-block',
                                  fontWeight: 'bold',
                                  color: g.replacementValue ? '#1976d2' : '#d32f2f',
                                  fontSize: '0.8rem'
                                }}>
                                  {g.replacementValue ? formatCurrency(g.replacementValue) : 'N/D'}
                                </Box>
                              </TableCell>
                              
                              <TableCell align="center">
                                {hasCompleteData ? (
                                  <CheckCircleIcon fontSize="small" color="success" />
                                ) : (
                                  <WarningIcon fontSize="small" color="warning" />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 2, 
                    pt: 2, 
                    borderTop: '1px solid #e0e0e0',
                    flexShrink: 0
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      {groups.length} grupos • {stats.completeGroups} completos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Haz clic para editar
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha: Formulario compacto (más angosto) */}
        <Grid item xs={12} md={10}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.1rem' }}>
                  <SettingsIcon /> {selectedGroupData ? "Editar" : "Seleccionar"}
                </Typography>
                {selectedGroupData && (
                  <Chip 
                    label="Editando" 
                    size="small" 
                    color="primary" 
                    icon={<EditIcon />}
                  />
                )}
              </Box>
              
              {/* Selector de grupo */}
              <TextField
                select
                label="Grupo de Herramientas"
                value={selectedGroup}
                onChange={(e) => handleGroupSelect(e.target.value)}
                fullWidth
                size="medium"
                sx={{ mb: 3 }}
                disabled={loading || saving}
                helperText={!selectedGroup ? "Selecciona de la lista" : ""}
              >
                <MenuItem value="">
                  -- Seleccionar grupo --
                </MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant="body2">
                        {g.name.length > 20 ? g.name.substring(0, 20) + "..." : g.name}
                      </Typography>
                      {(!g.tariff?.dailyRentalRate || !g.tariff?.dailyFineRate || !g.replacementValue) && (
                        <WarningIcon fontSize="small" color="warning" />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>

              {selectedGroupData && (
                <>
                  {/* Información del grupo seleccionado */}
                  <Box sx={{ 
                    p: 1.5, 
                    mb: 2, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 1,
                    backgroundColor: '#fafafa'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {selectedGroupData.name}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip label={selectedGroupData.category} size="small" color="info" sx={{ height: 24 }} />
                      <Typography variant="caption" color="text.secondary">
                        ID: {selectedGroupData.id}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Formulario de tarifas COMPACTO */}
                  <Stack spacing={2}>
                    {/* Tarifas de alquiler */}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: '#666' }}>
                        Tarifas Diarias
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            label="Alquiler ($)"
                            type="number"
                            value={groupRent}
                            onChange={(e) => {
                              setGroupRent(e.target.value);
                              if (formErrors.rent) setFormErrors({...formErrors, rent: ''});
                            }}
                            fullWidth
                            size="small"
                            error={!!formErrors.rent}
                            helperText={formErrors.rent}
                            InputProps={{
                              startAdornment: <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />,
                              inputProps: { min: 0, max: 1000000, step: 100 }
                            }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="Multa ($)"
                            type="number"
                            value={groupFine}
                            onChange={(e) => {
                              setGroupFine(e.target.value);
                              if (formErrors.fine) setFormErrors({...formErrors, fine: ''});
                            }}
                            fullWidth
                            size="small"
                            error={!!formErrors.fine}
                            helperText={formErrors.fine}
                            InputProps={{
                              startAdornment: <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />,
                              inputProps: { min: 0, max: 100000, step: 100 }
                            }}
                          />
                        </Grid>
                      </Grid>
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={saveGroupTariff}
                        disabled={!groupRent || !groupFine || saving || !!formErrors.rent || !!formErrors.fine}
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        {saving ? <CircularProgress size={16} /> : "Guardar Tarifas"}
                      </Button>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Valor de reposición */}
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, color: '#666' }}>
                        Valor de Reposición
                      </Typography>
                      <TextField
                        label="Reposición ($)"
                        type="number"
                        value={replacementValue}
                        onChange={(e) => {
                          setReplacementValue(e.target.value);
                          if (formErrors.replacement) setFormErrors({...formErrors, replacement: ''});
                        }}
                        fullWidth
                        size="small"
                        error={!!formErrors.replacement}
                        helperText={formErrors.replacement}
                        InputProps={{
                          startAdornment: <AttachMoneyIcon fontSize="small" sx={{ mr: 0.5 }} />,
                          inputProps: { min: 0, max: 10000000, step: 1000 }
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={saveReplacementValue}
                        disabled={!replacementValue || saving || !!formErrors.replacement}
                        fullWidth
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        {saving ? <CircularProgress size={16} /> : "Guardar Reposición"}
                      </Button>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Botón para actualizar todo */}
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                      onClick={handleUpdateAll}
                      disabled={!groupRent || !groupFine || !replacementValue || saving || 
                               !!formErrors.rent || !!formErrors.fine || !!formErrors.replacement}
                      fullWidth
                      size="small"
                      sx={{ 
                        background: "linear-gradient(135deg, #6c63ff 0%, #9d4edd 100%)",
                        "&:hover": { background: "linear-gradient(135deg, #5a52d5 0%, #8a3dc8 100%)" },
                        py: 0.75,
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      {saving ? "Actualizando..." : "Actualizar Todo"}
                    </Button>
                  </Stack>
                </>
              )}

              {!selectedGroupData && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SettingsIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Selecciona un grupo de la lista para editar sus tarifas
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Nota informativa */}
      <Alert 
        severity="info" 
        sx={{ 
          mt: 3,
          backgroundColor: '#e3f2fd',
          fontSize: '0.85rem',
          py: 1
        }}
        icon={<InfoIcon fontSize="small" />}
      >
        <Typography variant="body2">
          Las tarifas se aplican inmediatamente a nuevos préstamos. Préstamos existentes mantienen las tarifas originales.
        </Typography>
      </Alert>
    </Paper>
  );
};

export default TariffView;