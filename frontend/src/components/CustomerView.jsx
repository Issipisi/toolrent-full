import { useEffect, useState } from "react";
import customerService from "../services/customer.service";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box, Chip, Grid, Card, CardContent, Alert, IconButton,
  Stack, Avatar, CircularProgress
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import PeopleIcon from '@mui/icons-material/People';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';

const CustomerView = () => {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({ 
    name: "", 
    rut: "", 
    phone: "", 
    email: "" 
  });
  const [searchTerm, setSearchTerm] = useState("");

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll();
      const data = res.data || res; // Compatible con ambos formatos
      const filtered = data.filter(c => c.email !== "system@toolrent.com");
      setCustomers(filtered);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cargando clientes' });
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      // Mantener compatibilidad con ambas versiones del service
      if (typeof customerService.register === 'function') {
        // Versión antigua: customerService.register(name, rut, phone, email)
        await customerService.register(form.name, form.rut, form.phone, form.email);
      } else if (customerService.registerCustomer) {
        // Otra posible versión
        await customerService.registerCustomer(form);
      }
      
      setMessage({ type: 'success', text: 'Cliente registrado exitosamente' });
      setOpen(false);
      setForm({ name: "", rut: "", phone: "", email: "" });
      loadCustomers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || "Error al registrar cliente" 
      });
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      // Mantener compatibilidad con ambas versiones del service
      if (typeof customerService.changeStatus === 'function') {
        // Versión antigua
        await customerService.changeStatus(id, newStatus);
      } else if (customerService.updateStatus) {
        // Versión nueva
        await customerService.updateStatus(id, newStatus);
      }
      
      setMessage({ 
        type: 'success', 
        text: `Cliente ${newStatus === "ACTIVE" ? "activado" : "restringido"}` 
      });
      loadCustomers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || error.message || "Error cambiando estado" 
      });
    }
  };

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer =>
    searchTerm === "" ||
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  // Estadísticas
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'ACTIVE').length,
    restricted: customers.filter(c => c.status === 'RESTRICTED').length,
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const formatRUT = (rut) => {
    if (!rut) return "";
    // Formatear RUT: 12345678-9 → 12.345.678-9
    return rut.replace(/(\d{1,2})(\d{3})(\d{3})([\dkK])$/, '$1.$2.$3-$4');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <PeopleIcon /> Gestión de Clientes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra la información de los clientes del sistema
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
          sx={{ 
            background: "#6c63ff",
            "&:hover": { background: "#5a52d5" }
          }}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* Mensajes */}
      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">Clientes Totales</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#4caf50" }}>
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">Activos</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#f44336" }}>
                {stats.restricted}
              </Typography>
              <Typography variant="body2" color="text.secondary">Restringidos</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Búsqueda */}
      <Box sx={{ 
        p: 2, 
        mb: 3, 
        border: '1px solid #e0e0e0', 
        borderRadius: 2,
        backgroundColor: '#fafafa'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SearchIcon color="action" />
          <TextField
            fullWidth
            placeholder="Buscar cliente por nombre, RUT, email o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            variant="outlined"
          />
          <Button 
            startIcon={<RefreshIcon />} 
            onClick={loadCustomers}
            size="small"
            disabled={loading}
          >
            Actualizar
          </Button>
        </Box>
      </Box>

      {/* Tabla de Clientes */}
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
              <TableCell>Cliente</TableCell>
              <TableCell>Contacto</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={30} />
                  <Typography sx={{ mt: 1 }}>Cargando clientes...</Typography>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow 
                  key={customer.id} 
                  hover 
                  sx={{ 
                    '&:hover': { backgroundColor: '#f5f0ff' },
                    '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' }
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: customer.status === 'ACTIVE' ? '#4caf50' : '#f44336',
                        width: 40, 
                        height: 40 
                      }}>
                        {getInitial(customer.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {customer.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <BadgeIcon sx={{ mr: 0.5, fontSize: '0.8rem' }} />
                          {formatRUT(customer.rut)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {customer.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {customer.phone}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={customer.status === 'ACTIVE' ? 'ACTIVO' : 'RESTRINGIDO'} 
                      size="small"
                      sx={{
                        backgroundColor: customer.status === 'ACTIVE' ? '#4caf50' : '#f44336',
                        color: 'white',
                        fontWeight: 'bold',
                        minWidth: 100
                      }}
                      icon={customer.status === 'ACTIVE' ? <CheckCircleIcon /> : <BlockIcon />}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={customer.status === 'ACTIVE' ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      onClick={() => handleChangeStatus(customer.id, customer.status === 'ACTIVE' ? 'RESTRICTED' : 'ACTIVE')}
                      sx={{ 
                        color: customer.status === 'ACTIVE' ? '#f44336' : '#4caf50',
                        borderColor: customer.status === 'ACTIVE' ? '#f44336' : '#4caf50',
                        '&:hover': {
                          backgroundColor: customer.status === 'ACTIVE' ? '#ffebee' : '#e8f5e9'
                        }
                      }}
                    >
                      {customer.status === 'ACTIVE' ? 'Restringir' : 'Activar'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pie de tabla */}
      {!loading && filteredCustomers.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mt: 2, 
          pt: 2, 
          borderTop: '1px solid #e0e0e0' 
        }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {filteredCustomers.length} de {customers.length} clientes
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {searchTerm && `Resultados para: "${searchTerm}"`}
          </Typography>
        </Box>
      )}

      {/* Modal de Registro */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: "#6c63ff", 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <PersonAddIcon /> Registrar Nuevo Cliente
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Nombre Completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
              margin="normal"
              helperText="Nombre y apellido del cliente"
            />
            
            <TextField
              label="RUT"
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              fullWidth
              required
              margin="normal"
              helperText="Ejemplo: 12345678-9"
            />
            
            <TextField
              label="Teléfono"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
              required
              margin="normal"
              helperText="Ejemplo: +56 9 1234 5678"
            />
            
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              required
              margin="normal"
              helperText="correo@ejemplo.com"
            />
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpen(false)} 
            sx={{ color: "#666" }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleRegister} 
            variant="contained"
            disabled={!form.name || !form.rut || !form.phone || !form.email}
            sx={{ 
              background: "#6c63ff",
              "&:hover": { background: "#5a52d5" }
            }}
          >
            Registrar Cliente
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CustomerView;