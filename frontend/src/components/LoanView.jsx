import React, { useEffect, useState } from "react";
import loanService from "../services/loan.service";
import customerService from "../services/customer.service";
import toolGroupService from "../services/toolGroup.service";
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography,
  MenuItem, Stack, Chip, Alert, Grid, Card, CardContent,
  Tooltip, CircularProgress
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaidIcon from '@mui/icons-material/Paid';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import ErrorIcon from '@mui/icons-material/Error';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';

const LoanView = () => {
  const [loans, setLoans] = useState([]);
  const [debts, setDebts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openPreReturn, setOpenPreReturn] = useState(false);
  const [preDamageAmount, setPreDamageAmount] = useState("0");
  const [preIrreparable, setPreIrreparable] = useState(false);
  const [preDamageType, setPreDamageType] = useState("none");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [customers, setCustomers] = useState([]);
  const [tools, setTools] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    toolGroupId: "",
    dueDate: dayjs().add(7, 'day'),
  });

  /* ---------- CARGAS ---------- */
  const loadAll = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadActive(),
        loadPendingPayment(),
        loadCustomers(),
        loadTools()
      ]);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error cargando datos' });
    } finally {
      setLoading(false);
    }
  };

  const loadActive = async () => {
    try {
      // Compatible con ambas versiones del service
      const res = await loanService.getActive();
      const data = res.data || res || [];
      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando préstamos activos:", error);
      setLoans([]);
    }
  };

  const loadPendingPayment = async () => {
    try {
      // Compatible con ambas versiones del service
      const res = await loanService.getPendingPayment();
      const data = res.data || res || [];
      setDebts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando préstamos con deudas:", error);
      setDebts([]);
    }
  };

  const loadCustomers = async () => {
    try {
      // Compatible con ambas versiones del service
      const res = await customerService.getActive();
      const data = res.data || res || [];
      setCustomers(Array.isArray(data) ? data.filter(c => c.name !== "Sistema") : []);
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setCustomers([]);
    }
  };

  const loadTools = async () => {
    try {
      // Compatible con ambas versiones del service
      const res = await toolGroupService.getAvailable();
      const data = res.data || res || [];
      setTools(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando herramientas:", error);
      setTools([]);
    }
  };

  useEffect(() => {
    loadAll();
    
    const handleDebtUpdate = () => {
      loadPendingPayment();
    };
    window.addEventListener("debtUpdated", handleDebtUpdate);

    return () => window.removeEventListener("debtUpdated", handleDebtUpdate);
  }, []);

  /* ---------- HANDLERS ---------- */
  const handleRegister = async () => {
    try {
      // Mantener compatibilidad con versiones antiguas del service
      if (typeof loanService.register === 'function') {
        // Versión antigua: register(toolGroupId, customerId, dueDate)
        await loanService.register(
          form.toolGroupId,
          form.customerId,
          form.dueDate.format("YYYY-MM-DDTHH:mm:ss")
        );
      }
      
      console.log('1. Antes de setMessage');
      setMessage({ type: 'success', text: '✅ Préstamo registrado exitosamente' });
      
      console.log('2. Mensaje establecido:', message); // OJO: esto mostrará el estado anterior

       // Para ver el estado actual, usa un useEffect o timeout
      setTimeout(() => {
        console.log('3. Estado actual de message:', message);
      }, 0);

      setOpen(false);
      setForm({ customerId: "", toolGroupId: "", dueDate: dayjs().add(7, 'day') });

      console.log('4. Después de setOpen');

      loadAll();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || "Error desconocido";
      setMessage({ type: 'error', text: `❌ No se puede registrar: ${msg}` });
    }
  };

  const handlePreReturn = (loanId) => {
    setOpenPreReturn(true);
    sessionStorage.setItem("pendingReturnId", loanId);
  };

  const handleDamageTypeChange = (e) => {
    const val = e.target.value;
    setPreDamageType(val);
    if (val === "none") {
      setPreIrreparable(false);
      setPreDamageAmount("0");
    } else if (val === "irreparable") {
      setPreIrreparable(true);
      setPreDamageAmount("0");
    } else {
      setPreIrreparable(false);
    }
  };

  const handleConfirmReturn = async () => {
    const loanId = sessionStorage.getItem("pendingReturnId");
    const amount = preIrreparable ? 0 : parseFloat(preDamageAmount);
    
    try {
      // Compatible con versiones antiguas del service
      if (typeof loanService.returnLoan === 'function') {
        await loanService.returnLoan(loanId, amount, preIrreparable);
      }

      if (preDamageType === "leve" && amount > 0) {
        const loan = loans.find(l => l.id == loanId);
        if (loan?.toolUnitId && typeof loanService.sendToRepair === 'function') {
          await loanService.sendToRepair(loan.toolUnitId);
        }
      }

      setMessage({ type: 'success', text: '✅ Devolución registrada exitosamente' });
      setOpenPreReturn(false);
      setPreDamageAmount("0");
      setPreIrreparable(false);
      setPreDamageType("none");
      loadAll();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || "Error desconocido";
      setMessage({ type: 'error', text: `❌ Error en devolución: ${msg}` });
    }
  };

  const handlePayDebts = async (loanId) => {
    if (!confirm("¿Marcar como pagadas las deudas de este préstamo?")) return;
    try {
      // Compatible con versiones antiguas del service
      if (typeof loanService.payDebts === 'function') {
        await loanService.payDebts(loanId);
      }
      
      setMessage({ type: 'success', text: '✅ Deudas pagadas exitosamente' });
      loadPendingPayment();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || error.message || "Error desconocido";
      setMessage({ type: 'error', text: `❌ Error pagando deudas: ${msg}` });
    }
  };

  // Estadísticas
  const stats = {
    totalActive: loans.length,
    totalDebts: debts.length,
    totalDebtAmount: debts.reduce((sum, d) => sum + (d.fineAmount || 0) + (d.damageCharge || 0), 0),
    overdueLoans: loans.filter(l => dayjs(l.dueDate).isBefore(dayjs())).length
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Verificar si préstamo está vencido
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return dayjs(dueDate).isBefore(dayjs());
  };

  // Formato de moneda
  const formatCurrency = (amount) => {
    return `$${(amount || 0).toLocaleString()}`;
  };

  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      {/* Encabezado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalActivityIcon /> Gestión de Préstamos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra préstamos, devoluciones y pagos de clientes
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={loadAll}
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
            Nuevo Préstamo
          </Button>
        </Stack>
      </Box>

      {/* Mensajes */}
      {message.text && (
        <Alert 
          severity={message.type} 
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#6c63ff" }}>
                {stats.totalActive}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Préstamos Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#f44336" }}>
                {stats.overdueLoans}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Préstamos Vencidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#ff9800" }}>
                {stats.totalDebts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Con Deudas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#9c27b0" }}>
                {formatCurrency(stats.totalDebtAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Deuda Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ---------- PRÉSTAMOS ACTIVOS ---------- */}
      <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon /> Préstamos Activos
            </Typography>
            <Chip 
              label={`${loans.length} activos`} 
              sx={{ 
                backgroundColor: '#6c63ff',
                color: 'white',
                fontWeight: 'bold'
              }}
              size="small" 
            />
          </Box>
          
          <TableContainer sx={{ maxHeight: 400, borderRadius: 1 }}>
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
                  <TableCell>Herramienta</TableCell>
                  <TableCell width="150px">Fecha Préstamo</TableCell>
                  <TableCell width="150px">Fecha Entrega</TableCell>
                  <TableCell width="100px">Estado</TableCell>
                  <TableCell width="120px">Acciones</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>Cargando préstamos...</Typography>
                    </TableCell>
                  </TableRow>
                ) : loans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <InventoryIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                      <Typography color="text.secondary">No hay préstamos activos</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  loans.map((loan) => (
                    <TableRow 
                      key={loan.id} 
                      hover 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f5f0ff' },
                        backgroundColor: isOverdue(loan.dueDate) ? '#ffebee' : 'inherit'
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {loan.customerName || 'Cliente no especificado'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BuildIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {loan.toolName || 'Herramienta no especificada'}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        {formatDate(loan.loanDate)}
                      </TableCell>
                      
                      <TableCell sx={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.85rem',
                        color: isOverdue(loan.dueDate) ? '#f44336' : 'inherit',
                        fontWeight: isOverdue(loan.dueDate) ? 'bold' : 'normal'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon fontSize="small" />
                          {formatDate(loan.dueDate)}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={isOverdue(loan.dueDate) ? "VENCIDO" : "ACTIVO"} 
                          size="small"
                          sx={{
                            backgroundColor: isOverdue(loan.dueDate) ? '#f44336' : '#4caf50',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                          icon={isOverdue(loan.dueDate) ? <WarningIcon /> : <CheckCircleIcon />}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title="Registrar Devolución">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ArrowForwardIcon />}
                            onClick={() => handlePreReturn(loan.id)}
                            sx={{ 
                              textTransform: 'none',
                              borderColor: '#6c63ff',
                              color: '#6c63ff',
                              '&:hover': {
                                backgroundColor: '#f0f4ff',
                                borderColor: '#5a52d5'
                              }
                            }}
                          >
                            Devolver
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ---------- PENDIENTES DE PAGO ---------- */}
      <Card sx={{ border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: "#f44336", display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon /> Pendientes de Pago
            </Typography>
            <Chip 
              label={`${debts.length} con deudas`} 
              sx={{ 
                backgroundColor: '#f44336',
                color: 'white',
                fontWeight: 'bold'
              }}
              size="small" 
            />
          </Box>
          
          <TableContainer sx={{ maxHeight: 400, borderRadius: 1 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ 
                  '& th': { 
                    backgroundColor: '#f44336', 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                  }
                }}>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Herramienta</TableCell>
                  <TableCell width="150px">Fecha Devolución</TableCell>
                  <TableCell width="120px">Multa</TableCell>
                  <TableCell width="120px">Daño</TableCell>
                  <TableCell width="120px">Total</TableCell>
                  <TableCell width="120px">Acciones</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>Cargando deudas...</Typography>
                    </TableCell>
                  </TableRow>
                ) : debts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <PaidIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                      <Typography color="text.secondary">No hay deudas pendientes</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  debts.map((debt) => {
                    const fine = debt.fineAmount || 0;
                    const damage = debt.damageCharge || 0;
                    const total = fine + damage;
                    
                    return (
                      <TableRow 
                        key={debt.id} 
                        hover 
                        sx={{ 
                          '&:hover': { backgroundColor: '#ffebee' }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PeopleIcon fontSize="small" color="action" />
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {debt.customerName || 'Cliente no especificado'}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BuildIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {debt.toolName || 'Herramienta no especificada'}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {debt.returnDate ? formatDate(debt.returnDate) : 'No devuelto'}
                        </TableCell>
                        
                        <TableCell>
                          {fine > 0 ? (
                            <Box sx={{ 
                              backgroundColor: '#fff3e0', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1,
                              display: 'inline-block',
                              fontFamily: 'monospace',
                              fontWeight: 'bold'
                            }}>
                              {formatCurrency(fine)}
                            </Box>
                          ) : (
                            <Chip label="Sin multa" size="small" sx={{ fontSize: '0.75rem' }} />
                          )}
                        </TableCell>
                        
                        <TableCell>
                          {damage > 0 ? (
                            <Box sx={{ 
                              backgroundColor: '#ffebee', 
                              px: 1, 
                              py: 0.5, 
                              borderRadius: 1,
                              display: 'inline-block',
                              fontFamily: 'monospace',
                              fontWeight: 'bold'
                            }}>
                              {formatCurrency(damage)}
                            </Box>
                          ) : (
                            <Chip label="Sin daño" size="small" sx={{ fontSize: '0.75rem' }} />
                          )}
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 'bold', 
                            color: total > 0 ? '#f44336' : '#4caf50',
                            fontFamily: 'monospace'
                          }}>
                            {formatCurrency(total)}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Tooltip title="Marcar como pagado">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<PaidIcon />}
                              onClick={() => handlePayDebts(debt.id)}
                              sx={{ 
                                textTransform: 'none',
                                backgroundColor: '#4caf50',
                                '&:hover': { backgroundColor: '#388e3c' }
                              }}
                            >
                              Pagar
                            </Button>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          {debts.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 2, 
              pt: 2, 
              borderTop: '1px solid #e0e0e0' 
            }}>
              <Typography variant="body2" color="text.secondary">
                Total de deuda pendiente: <strong>{formatCurrency(stats.totalDebtAmount)}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Actualizado: {dayjs().format('HH:mm')}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Modal Nuevo Préstamo */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: "#6c63ff", 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <AddIcon /> Nuevo Préstamo
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField 
              select 
              label="Cliente"
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="">
                -- Seleccionar cliente --
              </MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ‑ {c.rut}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField 
              select 
              label="Grupo de Herramientas"
              value={form.toolGroupId}
              onChange={(e) => setForm({ ...form, toolGroupId: e.target.value })}
              fullWidth
              required
              margin="normal"
            >
              <MenuItem value="">
                -- Seleccionar herramienta --
              </MenuItem>
              {tools.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name} ({t.category})
                </MenuItem>
              ))}
            </TextField>
            
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Fecha de Entrega Pactada"
                value={form.dueDate}
                onChange={(newVal) => setForm({ ...form, dueDate: newVal })}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    margin: "normal",
                    helperText: "Fecha límite para la devolución"
                  } 
                }}
              />
            </LocalizationProvider>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{ color: "#666" }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRegister} 
            variant="contained"
            disabled={!form.customerId || !form.toolGroupId}
            sx={{ 
              background: "#6c63ff",
              "&:hover": { background: "#5a52d5" }
            }}
          >
            Registrar Préstamo
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Devolución */}
      <Dialog open={openPreReturn} onClose={() => setOpenPreReturn(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          background: "#4caf50", 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ArrowForwardIcon /> Registrar Devolución
        </DialogTitle>
        
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <Typography variant="body1">
              Indica el estado de la herramienta devuelta:
            </Typography>
            
            <TextField
              select
              label="Estado de la Herramienta"
              value={preDamageType}
              onChange={handleDamageTypeChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="none">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography>Sin daño - Estado normal</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="leve">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningIcon color="warning" />
                  <Typography>Daño leve - Requiere reparación</Typography>
                </Box>
              </MenuItem>
              <MenuItem value="irreparable">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ErrorIcon color="error" />
                  <Typography>Daño irreparable - Requiere baja</Typography>
                </Box>
              </MenuItem>
            </TextField>
            
            {preDamageType === "leve" && (
              <TextField
                label="Monto del daño leve ($)"
                type="number"
                value={preDamageAmount}
                onChange={(e) => setPreDamageAmount(e.target.value)}
                fullWidth
                margin="normal"
                helperText="Costo estimado de reparación"
              />
            )}
            
            {preDamageType === "irreparable" && (
              <Alert severity="warning">
                La herramienta será dada de baja y se cobrará el valor de reposición al cliente.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPreReturn(false)} sx={{ color: "#666" }}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmReturn} 
            variant="contained"
            sx={{ 
              backgroundColor: 
                preDamageType === "irreparable" ? "#f44336" : 
                preDamageType === "leve" ? "#ff9800" : "#4caf50",
              "&:hover": { 
                backgroundColor: 
                  preDamageType === "irreparable" ? "#d32f2f" : 
                  preDamageType === "leve" ? "#f57c00" : "#388e3c"
              }
            }}
          >
            {preDamageType === "irreparable" ? "Registrar Baja" : 
             preDamageType === "leve" ? "Registrar con Daño" : "Confirmar Devolución"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LoanView;