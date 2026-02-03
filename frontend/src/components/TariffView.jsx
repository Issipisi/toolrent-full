import { useEffect, useState } from "react";
import toolGroupService from "../services/toolGroup.service";
import {
  Paper, TextField, Typography, Stack, MenuItem, Alert,
  Box, Grid, Card, CardContent, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';

const TariffView = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedGroupData, setSelectedGroupData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Mantiene tu estructura original de estados
  const [groupRent, setGroupRent] = useState("");
  const [groupFine, setGroupFine] = useState("");
  const [replacementValue, setReplacementValue] = useState("");

  useEffect(() => {
    loadGroups();
  }, []);

  // Mantiene tu función original de carga
  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await toolGroupService.getAll(); // Tu método original
      setGroups(res.data || []);
      setMessage({ type: '', text: '' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cargando grupos' });
    } finally {
      setLoading(false);
    }
  };

  // Modifica ligeramente para usar tu función original
  const handleGroupSelect = async (groupId) => {
    setSelectedGroup(groupId);
    if (!groupId) {
      setSelectedGroupData(null);
      return;
    }
    
    // Encuentra el grupo en la lista ya cargada (como en tu código original)
    const g = groups.find((gr) => gr.id === groupId);
    if (!g) return;
    
    setSelectedGroupData(g);
    
    // Usa tu estructura original de datos
    setGroupRent(g.tariff?.dailyRentalRate || 0);
    setGroupFine(g.tariff?.dailyFineRate || 0);
    setReplacementValue(g.replacementValue || 0);
  };

  // Mantiene tus funciones originales con mejor manejo de errores
  const saveGroupTariff = async () => {
    if (!selectedGroup) return;
    
    try {
      // Tu función original
      await toolGroupService.updateTariff(
        selectedGroup, 
        parseFloat(groupRent), 
        parseFloat(groupFine)
      );
      setMessage({ type: 'success', text: 'Tarifa actualizada correctamente' });
      
      // Recarga los datos
      loadGroups();
      handleGroupSelect(selectedGroup);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error: ' + (error.response?.data || "Update failed") 
      });
    }
  };

  const saveReplacementValue = async () => {
    if (!selectedGroup) return;
    
    try {
      // Tu función original
      await toolGroupService.updateReplacementValue(
        selectedGroup, 
        parseFloat(replacementValue)
      );
      setMessage({ type: 'success', text: 'Valor de reposición actualizado' });
      
      // Recarga los datos
      loadGroups();
      handleGroupSelect(selectedGroup);
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error: ' + (error.response?.data || "Update failed") 
      });
    }
  };

  // Función para actualizar todo
  const handleUpdateAll = async () => {
    if (!selectedGroup) return;
    
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
      
      setMessage({ type: 'success', text: 'Todas las tarifas actualizadas' });
      loadGroups();
      handleGroupSelect(selectedGroup);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error actualizando tarifas' });
    }
  };

  // Estadísticas generales
  const stats = {
    avgRentalRate: groups.length > 0 
      ? groups.reduce((sum, g) => sum + (g.tariff?.dailyRentalRate || 0), 0) / groups.length 
      : 0,
    avgReplacement: groups.length > 0 
      ? groups.reduce((sum, g) => sum + (g.replacementValue || 0), 0) / groups.length 
      : 0,
    totalGroups: groups.length
  };

  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      {/* ---------- Encabezado mejorado ---------- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachMoneyIcon /> Gestión de Tarifas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configura tarifas de alquiler, multas y valores de reposición
          </Typography>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={loadGroups}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {/* ---------- Mensajes de estado ---------- */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* ---------- Tarjetas de estadísticas ---------- */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4}}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {stats.totalGroups}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Grupos de Herramientas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4}}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                ${Math.round(stats.avgRentalRate).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tarifa Diaria Promedio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4}}>
          <Card sx={{ borderLeft: '4px solid #2196f3' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                ${Math.round(stats.avgReplacement).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Reposición Promedio
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ---------- Vista principal: dos columnas ---------- */}
      <Grid container spacing={3}>
        {/* Columna izquierda: Selector y formulario */}
        <Grid size={{ xs: 12, md: 5}}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SettingsIcon /> Configurar Tarifas
              </Typography>
              
              {/* Selector de grupo (mantiene tu lógica) */}
              <TextField
                select
                label="Seleccionar Grupo de Herramientas"
                value={selectedGroup}
                onChange={(e) => handleGroupSelect(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
              >
                <MenuItem value="">
                  -- Seleccionar un grupo --
                </MenuItem>
                {groups.map((g) => (
                  <MenuItem key={g.id} value={g.id}>
                    {g.name} ({g.category})
                  </MenuItem>
                ))}
              </TextField>

              {selectedGroupData && (
                <>
                  {/* Información del grupo seleccionado */}
                  <Box sx={{ 
                    p: 2, 
                    mb: 3, 
                    border: '1px solid #e0e0e0', 
                    borderRadius: 2,
                    backgroundColor: '#fafafa'
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {selectedGroupData.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip label={selectedGroupData.category} size="small" />
                      <Chip 
                        label={`Stock: ${selectedGroupData.availableCount || 0}/${selectedGroupData.totalStock || 0}`} 
                        size="small" 
                        color="info" 
                      />
                    </Stack>
                  </Box>

                  {/* Formulario de tarifas (usa tus estados originales) */}
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Tarifas de Alquiler
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6}}>
                          <TextField
                            label="Tarifa Diaria ($)"
                            type="number"
                            value={groupRent}
                            onChange={(e) => setGroupRent(e.target.value)}
                            fullWidth
                            InputProps={{
                              startAdornment: <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 6}}>
                          <TextField
                            label="Multa Diaria ($)"
                            type="number"
                            value={groupFine}
                            onChange={(e) => setGroupFine(e.target.value)}
                            fullWidth
                            InputProps={{
                              startAdornment: <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                            }}
                          />
                        </Grid>
                      </Grid>
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={saveGroupTariff}
                        disabled={!groupRent || !groupFine}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Guardar Tarifa
                      </Button>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Valor de Reposición
                      </Typography>
                      <TextField
                        label="Valor de Reposición ($)"
                        type="number"
                        value={replacementValue}
                        onChange={(e) => setReplacementValue(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: <AttachMoneyIcon fontSize="small" sx={{ mr: 1 }} />
                        }}
                      />
                      <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={saveReplacementValue}
                        disabled={!replacementValue}
                        fullWidth
                        sx={{ mt: 2 }}
                      >
                        Guardar Valor de Reposición
                      </Button>
                    </Box>

                    {/* Botón para actualizar todo */}
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleUpdateAll}
                      disabled={!groupRent || !groupFine || !replacementValue}
                      fullWidth
                      sx={{ 
                        background: "#6c63ff",
                        "&:hover": { background: "#5a52d5" }
                      }}
                    >
                      Actualizar Todas las Tarifas
                    </Button>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Columna derecha: Tabla de resumen */}
        <Grid size={{ xs: 12, md: 7}}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon /> Resumen de Tarifas
              </Typography>
              
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={{ 
                      '& th': { 
                        backgroundColor: '#6c63ff', 
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }
                    }}>
                      <TableCell>Herramienta</TableCell>
                      <TableCell align="right">Alquiler/Día</TableCell>
                      <TableCell align="right">Multa/Día</TableCell>
                      <TableCell align="right">Reposición</TableCell>
                    </TableRow>
                  </TableHead>
                  
                  <TableBody>
                    {groups.map((g) => (
                      <TableRow 
                        key={g.id} 
                        hover 
                        selected={g.id.toString() === selectedGroup}
                        onClick={() => handleGroupSelect(g.id)}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f0ff' },
                          '&.Mui-selected': { backgroundColor: '#e8e1ff' }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BuildIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {g.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {g.category}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          <Box sx={{ 
                            backgroundColor: '#e8f5e9', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            display: 'inline-block'
                          }}>
                            ${(g.tariff?.dailyRentalRate || 0).toLocaleString()}
                          </Box>
                        </TableCell>
                        
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          <Box sx={{ 
                            backgroundColor: '#ffebee', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            display: 'inline-block'
                          }}>
                            ${(g.tariff?.dailyFineRate || 0).toLocaleString()}
                          </Box>
                        </TableCell>
                        
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          <Box sx={{ 
                            backgroundColor: '#e3f2fd', 
                            px: 1, 
                            py: 0.5, 
                            borderRadius: 1,
                            display: 'inline-block'
                          }}>
                            ${(g.replacementValue || 0).toLocaleString()}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mt: 2, 
                pt: 2, 
                borderTop: '1px solid #e0e0e0' 
              }}>
                <Typography variant="body2" color="text.secondary">
                  {groups.length} grupos listados
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Haz clic en una fila para editarla
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TariffView;