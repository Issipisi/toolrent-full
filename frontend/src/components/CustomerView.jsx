import { useEffect, useState } from "react";
import customerService from "../services/customer.service";
import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box, Chip, Grid, Card, CardContent, Alert, IconButton,
  Stack, Avatar, CircularProgress, FormControl, InputLabel, Select,
  MenuItem, Tooltip, DialogContentText
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
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import { useNotification } from "../components/NotificationProvider";
import BaseLayout from "../components/BaseLayout";
import ScrollableTable from "../components/ScrollableTable";

const CustomerView = () => {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [formErrors, setFormErrors] = useState({});
  
  const { showNotification } = useNotification();

  const [form, setForm] = useState({ 
    name: "", 
    rut: "", 
    phone: "", 
    email: "" 
  });

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getAll();
      const data = res.data || res;
      const filtered = data.filter(c => c.email !== "system@toolrent.com");
      setCustomers(filtered);
    } catch (error) {
      showNotification("Error cargando clientes", "error");
    } finally {
      setLoading(false);
    }
  };

  // ========== VALIDACIONES ==========
  const validateRUT = (rut) => {
    // Formato: 12345678-9
    const rutRegex = /^[0-9]{7,8}-[0-9kK]{1}$/;
    if (!rutRegex.test(rut)) {
      return "Formato inválido. Ejemplo: 12345678-9";
    }
    
    // Validar dígito verificador
    const [rutNumber, dv] = rut.split('-');
    const reversedDigits = rutNumber.split('').reverse().map(Number);
    
    let sum = 0;
    let multiplier = 2;
    
    for (let digit of reversedDigits) {
      sum += digit * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const expectedDV = 11 - (sum % 11);
    let expectedDVStr = expectedDV === 11 ? "0" : expectedDV === 10 ? "K" : expectedDV.toString();
    
    if (expectedDVStr.toUpperCase() !== dv.toUpperCase()) {
      return "RUT inválido. El dígito verificador no coincide";
    }
    
    return "";
  };

  const validatePhone = (phone) => {
    // Formato chileno: +56912345678 o 912345678
    const phoneRegex = /^(\+56)?9[0-9]{8}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    
    if (!phoneRegex.test(cleanPhone)) {
      return "Teléfono inválido. Ejemplo: +56 9 1234 5678 o 912345678";
    }
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Email inválido. Ejemplo: cliente@dominio.com";
    }
    return "";
  };

  const validateName = (name) => {
    if (name.length < 3) {
      return "Nombre debe tener al menos 3 caracteres";
    }
    if (name.length > 100) {
      return "Nombre demasiado largo (máx. 100 caracteres)";
    }
    return "";
  };

  const validateForm = () => {
    const errors = {};
    
    errors.name = validateName(form.name);
    errors.rut = validateRUT(form.rut);
    errors.phone = validatePhone(form.phone);
    errors.email = validateEmail(form.email);
    
    setFormErrors(errors);
    
    // Verificar si hay errores
    return !Object.values(errors).some(error => error !== "");
  };

  const formatPhone = (phone) => {
    // Formatear para mostrar: +56 9 1234 5678
    const cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
    if (cleanPhone.startsWith('569') && cleanPhone.length === 11) {
      return `+${cleanPhone.slice(0, 2)} ${cleanPhone.slice(2, 3)} ${cleanPhone.slice(3, 7)} ${cleanPhone.slice(7)}`;
    } else if (cleanPhone.startsWith('9') && cleanPhone.length === 9) {
      return `+56 ${cleanPhone.slice(0, 1)} ${cleanPhone.slice(1, 5)} ${cleanPhone.slice(5)}`;
    }
    return phone;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      showNotification("Corrige los errores en el formulario", "error");
      return;
    }

    try {
      await customerService.register(form.name, form.rut, form.phone, form.email);
      
      showNotification("Cliente registrado exitosamente", "success");
      setOpen(false);
      setForm({ name: "", rut: "", phone: "", email: "" });
      setFormErrors({});
      loadCustomers();
    } catch (error) {
      let message = "Error al registrar cliente";
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg.includes("RUT") || errorMsg.includes("rut")) {
        message = "El RUT ya está registrado en el sistema";
      } else if (errorMsg.includes("email") || errorMsg.includes("Email")) {
        message = "El email ya está registrado";
      }
      
      showNotification(message, "error");
    }
  };

  const handleOpenConfirm = (customer) => {
    setSelectedCustomer(customer);
    setOpenConfirm(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedCustomer) return;
    
    const newStatus = selectedCustomer.status === 'ACTIVE' ? 'RESTRICTED' : 'ACTIVE';
    
    try {
      await customerService.changeStatus(selectedCustomer.id, newStatus);
      
      const action = newStatus === 'ACTIVE' ? 'activado' : 'restringido';
      showNotification(`Cliente ${action} exitosamente`, "success");
      
      setOpenConfirm(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (error) {
      showNotification("Error cambiando estado del cliente", "error");
    }
  };

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === "" ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = filterStatus === "TODOS" || 
      customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Estadísticas
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'ACTIVE').length,
    restricted: customers.filter(c => c.status === 'RESTRICTED').length,
    withDebts: customers.filter(c => (c.debt || 0) > 0).length
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const formatRUT = (rut) => {
    if (!rut) return "";
    return rut.replace(/(\d{1,2})(\d{3})(\d{3})([\dkK])$/, '$1.$2.$3-$4');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <BaseLayout>
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
        <Tooltip title="Registrar nuevo cliente">
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
        </Tooltip>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" color="primary.main">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">Clientes Totales</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #4caf50' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#4caf50" }}>
                {stats.active}
              </Typography>
              <Typography variant="body2" color="text.secondary">Activos</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid #f44336' }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#f44336" }}>
                {stats.restricted}
              </Typography>
              <Typography variant="body2" color="text.secondary">Restringidos</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
 

      {/* Búsqueda y Filtros */}
      <Card sx={{ mb: 3, backgroundColor: '#f8f9ff' }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 1 
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#6c63ff' }}>
              🔍 Buscar y Filtrar Clientes
            </Typography>
            
            {/* Botón Limpiar Filtros - MÁS VISIBLE */}
            {(searchTerm || filterStatus !== "TODOS") && (
              <Tooltip title="Limpiar todos los filtros">
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<RefreshIcon fontSize="small" />}
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("TODOS");
                  }}
                  sx={{
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    px: 2,
                    transition: 'all 0.2s ease'
                  }}
                >
                  Limpiar
                </Button>
              </Tooltip>
            )}
          </Box>
          
          {/* Filtros en una línea */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            {/* Campo de búsqueda */}
            <TextField
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              variant="outlined"
              sx={{ 
                flexGrow: 1,
                minWidth: '200px',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white'
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: '#6c63ff' }} />,
              }}
            />
            
            {/* Filtro por estado */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filterStatus}
                label="Estado"
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ 
                  backgroundColor: 'white',
                  minWidth: '150px'
                }}
              >
                <MenuItem value="TODOS">Todos los estados</MenuItem>
                <MenuItem value="ACTIVE">Solo activos</MenuItem>
                <MenuItem value="RESTRICTED">Solo restringidos</MenuItem>
              </Select>
            </FormControl>
            
            {/* Botón Actualizar */}
            <Tooltip title="Actualizar lista de clientes">
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadCustomers}
                disabled={loading}
                size="small"
                sx={{ 
                  minWidth: 'auto',
                  borderColor: '#6c63ff',
                  color: '#6c63ff',
                  '&:hover': {
                    borderColor: '#5a52d5',
                    backgroundColor: 'rgba(108, 99, 255, 0.04)'
                  }
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Actualizar'}
              </Button>
            </Tooltip>
          </Box>
          
          {/* Indicadores de filtros activos */}
          {(searchTerm || filterStatus !== "TODOS") && (
            <Box sx={{ 
              mt: 2, 
              display: 'flex', 
              gap: 1, 
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                Filtros activos:
              </Typography>
              
              {searchTerm && (
                <Chip 
                  label={`Búsqueda: "${searchTerm}"`} 
                  size="small"
                  onDelete={() => setSearchTerm("")}
                  sx={{ 
                    backgroundColor: '#6c63ff',
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-deleteIcon': {
                      color: 'white'
                    }
                  }}
                />
              )}
              
              {filterStatus !== "TODOS" && (
                <Chip 
                  label={`Estado: ${filterStatus === 'ACTIVE' ? 'Activos' : 'Restringidos'}`} 
                  size="small"
                  onDelete={() => setFilterStatus("TODOS")}
                  sx={{ 
                    backgroundColor: filterStatus === 'ACTIVE' ? '#4caf50' : '#f44336',
                    color: 'white',
                    fontWeight: 'bold',
                    '& .MuiChip-deleteIcon': {
                      color: 'white'
                    }
                  }}
                />
              )}
              
              {/* Contador de resultados */}
              <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Mostrando:
                </Typography>
                <Chip 
                  label={`${filteredCustomers.length} de ${customers.length}`} 
                  size="small"
                  variant="outlined"
                  sx={{ 
                    borderColor: '#6c63ff',
                    color: '#6c63ff',
                    fontWeight: 'bold'
                  }}
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Clientes */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: "#6c63ff" }}>
              Lista de Clientes
            </Typography>
            <Chip 
              label={`${filteredCustomers.length} de ${customers.length}`} 
              size="small"
              sx={{ 
                backgroundColor: '#6c63ff',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
          
          <ScrollableTable maxHeight="calc(100vh - 500px)">
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
                  <TableCell>Contacto</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell width="150px">Acciones</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CircularProgress size={30} />
                        <Typography sx={{ mt: 1 }}>Cargando clientes...</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <PeopleIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                        <Typography color="text.secondary">
                          {searchTerm || filterStatus !== "TODOS" 
                            ? 'No se encontraron clientes con los filtros actuales' 
                            : 'No hay clientes registrados'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow 
                      key={customer.id} 
                      hover 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f5f0ff' },
                        opacity: customer.status === 'RESTRICTED' ? 0.8 : 1
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
                              {(customer.debt || 0) > 0 && (
                                <Tooltip title="Tiene deudas pendientes">
                                  <WarningIcon 
                                    fontSize="small" 
                                    sx={{ 
                                      ml: 1, 
                                      color: '#ff9800',
                                      verticalAlign: 'middle'
                                    }} 
                                  />
                                </Tooltip>
                              )}
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
                              {formatPhone(customer.phone)}
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
                        {(customer.debt || 0) > 0 && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: '#ff9800' }}>
                            Deuda: ${(customer.debt || 0).toLocaleString()}
                          </Typography>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title={customer.status === 'ACTIVE' ? 'Restringir cliente' : 'Activar cliente'}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={customer.status === 'ACTIVE' ? <PersonRemoveIcon /> : <PersonAddIcon />}
                            onClick={() => handleOpenConfirm(customer)}
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
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollableTable>
        </CardContent>
      </Card>

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
              label="Nombre Completo *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
              required
              margin="normal"
              error={!!formErrors.name}
              helperText={formErrors.name || "Nombre y apellido del cliente"}
              autoFocus
            />
            
            <TextField
              label="RUT *"
              value={form.rut}
              onChange={(e) => setForm({ ...form, rut: e.target.value })}
              fullWidth
              required
              margin="normal"
              error={!!formErrors.rut}
              helperText={formErrors.rut || "Ejemplo: 12345678-9"}
              placeholder="12345678-9"
            />
            
            <TextField
              label="Teléfono *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
              required
              margin="normal"
              error={!!formErrors.phone}
              helperText={formErrors.phone || "Ejemplo: +56 9 1234 5678 o 912345678"}
              placeholder="+56 9 1234 5678"
            />
            
            <TextField
              label="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              fullWidth
              required
              margin="normal"
              error={!!formErrors.email}
              helperText={formErrors.email || "correo@ejemplo.com"}
              placeholder="cliente@ejemplo.com"
            />

            <Alert severity="info" sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Requisitos:</strong>
                <br />• RUT válido con dígito verificador
                <br />• Teléfono chileno (9 dígitos)
                <br />• Email válido
                <br />• Nombre completo (mín. 3 caracteres)
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => {
              setOpen(false);
              setForm({ name: "", rut: "", phone: "", email: "" });
              setFormErrors({});
            }} 
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

      {/* Modal de confirmación para cambiar estado */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="sm">
        <DialogTitle>
          {selectedCustomer?.status === 'ACTIVE' ? 'Restringir Cliente' : 'Activar Cliente'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedCustomer?.status === 'ACTIVE' ? (
              <>
                ¿Estás seguro de restringir al cliente <strong>{selectedCustomer?.name}</strong>?
                <br /><br />
                <strong>Consecuencias:</strong>
                <ul>
                  <li>No podrá solicitar nuevos préstamos</li>
                  <li>Se mantendrán sus préstamos activos actuales</li>
                  <li>Podrá devolver herramientas normalmente</li>
                  <li>Podrá pagar deudas pendientes</li>
                </ul>
                <br />
                Esta acción se puede revertir en cualquier momento.
              </>
            ) : (
              <>
                ¿Estás seguro de activar al cliente <strong>{selectedCustomer?.name}</strong>?
                <br /><br />
                <strong>Consecuencias:</strong>
                <ul>
                  <li>Podrá solicitar nuevos préstamos</li>
                  <li>Se respetarán las reglas de negocio</li>
                  <li>Debe estar al día en sus pagos</li>
                </ul>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} sx={{ color: "#666" }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleChangeStatus} 
            variant="contained"
            color={selectedCustomer?.status === 'ACTIVE' ? "error" : "success"}
            startIcon={selectedCustomer?.status === 'ACTIVE' ? <BlockIcon /> : <CheckCircleIcon />}
          >
            {selectedCustomer?.status === 'ACTIVE' ? 'Restringir' : 'Activar'}
          </Button>
        </DialogActions>
      </Dialog>
    </BaseLayout>
  );
};

export default CustomerView;