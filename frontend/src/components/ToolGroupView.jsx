import { useEffect, useState } from "react";
import toolGroupService from "../services/toolGroup.service";
import { 
  Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Chip, Alert, Grid, Card, CardContent, CircularProgress, MenuItem
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import RefreshIcon from '@mui/icons-material/Refresh';

const ToolGroupView = () => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({ 
    name: "", 
    category: "", 
    replacementValue: "", 
    pricePerDay: "", 
    stock: ""
  });

  const loadGroups = async () => {
    setLoading(true);
    try {
      const res = await toolGroupService.getAll();
      const data = res.data || res || [];
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cargando grupos de herramientas' });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      // Compatible con ambas versiones del service
      if (typeof toolGroupService.register === 'function') {
        // Versión antigua: register(name, category, replacementValue, pricePerDay, stock)
        await toolGroupService.register(
          form.name,
          form.category,
          parseFloat(form.replacementValue),
          parseFloat(form.pricePerDay),
          parseInt(form.stock)
        );
      }
      
      setMessage({ type: 'success', text: '✅ Grupo de herramientas creado exitosamente' });
      setOpen(false);
      setForm({ 
        name: "", category: "", replacementValue: "", 
        pricePerDay: "", stock: ""
      });
      loadGroups();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || "Error desconocido";
      setMessage({ type: 'error', text: `❌ Error al crear grupo: ${msg}` });
    }
  };

  // Estadísticas
  const stats = {
    totalGroups: groups.length,
    totalStock: groups.reduce((sum, g) => sum + (g.totalStock || g.units?.length || 0), 0),
    availableStock: groups.reduce((sum, g) => sum + (g.availableCount || g.units?.filter(u => u.status === "AVAILABLE")?.length || 0), 0),
    categories: [...new Set(groups.map(g => g.category).filter(Boolean))].length
  };

  useEffect(() => { 
    loadGroups(); 
  }, []);

  // Calcular stock disponible para un grupo
  const calculateAvailableStock = (group) => {
    if (group.availableCount !== undefined) return group.availableCount;
    if (group.units && Array.isArray(group.units)) {
      return group.units.filter(u => u.status === "AVAILABLE").length;
    }
    return 0;
  };

  // Obtener tarifa diaria
  const getDailyRate = (group) => {
    return group.tariff?.dailyRentalRate || group.dailyRentalRate || 0;
  };

  // Obtener valor de reposición
  const getReplacementValue = (group) => {
    return group.replacementValue || 0;
  };

  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon /> Grupos de Herramientas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra los grupos y categorías de herramientas
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={loadGroups}
            disabled={loading}
            size="small"
          >
            Actualizar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ 
              background: "#6c63ff",
              "&:hover": { background: "#5a52d5" }
            }}
            size="small"
          >
            Nuevo Grupo
          </Button>
        </Stack>
      </Box>

      {/* Mensajes */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 3}}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#6c63ff" }}>
                {stats.totalGroups}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Grupos Totales
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3}}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#4caf50" }}>
                {stats.availableStock}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3}}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#2196f3" }}>
                {stats.categories}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Categorías
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3}}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#ff9800" }}>
                {stats.totalStock}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stock Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla */}
      <TableContainer sx={{ maxHeight: '60vh', border: '1px solid #e0e0e0', borderRadius: 1 }}>
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
              <TableCell>Categoría</TableCell>
              <TableCell>Tarifa Diaria</TableCell>
              <TableCell>Valor Reposición</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>Cargando grupos...</Typography>
                </TableCell>
              </TableRow>
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <InventoryIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                  <Typography color="text.secondary">No hay grupos registrados</Typography>
                </TableCell>
              </TableRow>
            ) : (
              groups.map((group) => {
                const availableStock = calculateAvailableStock(group);
                const dailyRate = getDailyRate(group);
                const replacementValue = getReplacementValue(group);
                
                return (
                  <TableRow 
                    key={group.id} 
                    hover 
                    sx={{ 
                      '&:hover': { backgroundColor: '#f5f0ff' },
                      '&:nth-of-type(even)': { backgroundColor: '#fafafa' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BuildIcon fontSize="small" color="action" />
                        {group.name || 'Sin nombre'}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      {group.category ? (
                        <Chip 
                          label={group.category} 
                          size="small"
                          variant="outlined"
                          icon={<CategoryIcon fontSize="small" />}
                          sx={{ 
                            backgroundColor: 
                              group.category === 'Manual' ? '#e3f2fd' : 
                              group.category === 'Eléctrica' ? '#f3e5f5' : 
                              group.category === 'Neumática' ? '#e8f5e9' : '#fff3e0'
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sin categoría
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          ${dailyRate.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachMoneyIcon fontSize="small" sx={{ color: '#4caf50' }} />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          ${replacementValue.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box sx={{ 
                        backgroundColor: availableStock > 0 ? '#e8f5e9' : '#ffebee', 
                        px: 2, 
                        py: 0.5, 
                        borderRadius: 1,
                        display: 'inline-block',
                        fontFamily: 'monospace',
                        fontWeight: 'bold'
                      }}>
                        {availableStock}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={availableStock > 0 ? "DISPONIBLE" : "AGOTADO"} 
                        size="small"
                        sx={{
                          backgroundColor: availableStock > 0 ? '#4caf50' : '#f44336',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pie de tabla */}
      {!loading && groups.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 2, 
          pt: 2, 
          borderTop: '1px solid #e0e0e0' 
        }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {groups.length} grupos • {stats.availableStock} herramientas disponibles
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Actualizado: {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      )}

      {/* Modal de registro */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: "#6c63ff", 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AddIcon /> Nuevo Grupo de Herramientas
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Nombre del Grupo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
              margin="normal"
              helperText="Ej: Martillo Pesado, Taladro Percutor, Sierra Circular"
            />
            
            <TextField
              select
              label="Categoría"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="Manual">Manual</MenuItem>
              <MenuItem value="Eléctrica">Eléctrica</MenuItem>
              <MenuItem value="Neumática">Neumática</MenuItem>
              <MenuItem value="Hidráulica">Hidráulica</MenuItem>
              <MenuItem value="Corte">Corte</MenuItem>
              <MenuItem value="Jardinería">Jardinería</MenuItem>
              <MenuItem value="Construcción">Construcción</MenuItem>
              <MenuItem value="Otros">Otros</MenuItem>
            </TextField>
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6}}>
                <TextField
                  label="Tarifa Diaria ($)"
                  type="number"
                  value={form.pricePerDay}
                  onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })}
                  fullWidth
                  required
                  margin="normal"
                  helperText="Precio por día de alquiler"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6}}>
                <TextField
                  label="Valor de Reposición ($)"
                  type="number"
                  value={form.replacementValue}
                  onChange={(e) => setForm({ ...form, replacementValue: e.target.value })}
                  fullWidth
                  required
                  margin="normal"
                  helperText="Costo para reemplazar la herramienta"
                />
              </Grid>
            </Grid>
            
            <TextField
              label="Stock Inicial"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              fullWidth
              required
              margin="normal"
              helperText="Cantidad inicial de unidades disponibles"
              inputProps={{ min: 1 }}
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#666" }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRegister} 
            variant="contained"
            disabled={!form.name || !form.category || !form.pricePerDay || !form.replacementValue || !form.stock}
            sx={{ 
              background: "#6c63ff",
              "&:hover": { background: "#5a52d5" }
            }}
          >
            Crear Grupo
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ToolGroupView;