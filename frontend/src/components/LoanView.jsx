import React, { useEffect, useState, useMemo } from "react";
import BaseLayout from '../components/BaseLayout';
import ScrollableTable from '../components/ScrollableTable';
import loanService from "../services/loan.service";
import customerService from "../services/customer.service";
import toolGroupService from "../services/toolGroup.service";
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography,
  MenuItem, Stack, Chip, Alert, Grid, Card, CardContent,
  Tooltip, CircularProgress, DialogContentText, FormControl, InputLabel, Select
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
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import { useNotification } from "../components/NotificationProvider";

const LoanView = () => {
  const [loans, setLoans] = useState([]);
  const [debts, setDebts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openPreReturn, setOpenPreReturn] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [preDamageAmount, setPreDamageAmount] = useState("0");
  const [preIrreparable, setPreIrreparable] = useState(false);
  const [preDamageType, setPreDamageType] = useState("none");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Nuevos estados para ordenamiento y búsqueda
  const [sortField, setSortField] = useState("dueDate");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  
  const { showNotification } = useNotification();

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
      showNotification("Error cargando datos", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadActive = async () => {
    try {
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

  /* ---------- VALIDACIONES ---------- */
  const validateForm = () => {
    const errors = {};
    
    if (!form.customerId) {
      errors.customerId = "Selecciona un cliente";
    }
    
    if (!form.toolGroupId) {
      errors.toolGroupId = "Selecciona una herramienta";
    }
    
    if (form.dueDate && dayjs(form.dueDate).isBefore(dayjs())) {
      errors.dueDate = "La fecha de entrega no puede ser anterior a hoy";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /* ---------- HANDLERS ---------- */
  const handleRegister = async () => {
    if (!validateForm()) {
      showNotification("Corrige los errores en el formulario", "warning");
      return;
    }

    try {
      await loanService.register(
        form.toolGroupId,
        form.customerId,
        form.dueDate.format("YYYY-MM-DDTHH:mm:ss")
      );

      showNotification("Préstamo registrado exitosamente", "success");
      setOpen(false);
      setForm({ customerId: "", toolGroupId: "", dueDate: dayjs().add(7, 'day') });
      setFormErrors({});
      loadAll();
    } catch (error) {
      let userMessage = "Error al registrar préstamo";
      const msg = error.response?.data?.message || error.response?.data || error.message;
      const errorMsg = msg.toString().toLowerCase();
      
      if (errorMsg.includes("cliente con deuda") || errorMsg.includes("deuda") || errorMsg.includes("impaga")) {
        userMessage = "Cliente tiene deudas pendientes. Debe pagar antes de nuevo préstamo.";
      } else if (errorMsg.includes("préstamo vencido") || errorMsg.includes("atrasado")) {
        userMessage = "Cliente tiene préstamos vencidos sin devolver";
      } else if (errorMsg.includes("límite") || errorMsg.includes("activos") || errorMsg.includes("5")) {
        userMessage = "Cliente alcanzó el límite máximo de préstamos simultáneos (5)";
      } else if (errorMsg.includes("misma herramienta") || errorMsg.includes("ya tiene")) {
        userMessage = "El cliente ya tiene esta herramienta en préstamo. Debe devolverla primero.";
      } else if (errorMsg.includes("fecha") || errorMsg.includes("anterior")) {
        userMessage = "La fecha de devolución no puede ser anterior a la fecha actual";
      } else {
        userMessage = `Error: ${msg}`;
      }
      
      showNotification(userMessage, "error");
    }
  };

  const handlePreReturn = (loanId) => {
    setSelectedLoanId(loanId);
    setOpenPreReturn(true);
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
    if (!selectedLoanId) return;
    
    const amount = preIrreparable ? 0 : parseFloat(preDamageAmount);
    
    try {
      await loanService.returnLoan(selectedLoanId, amount, preIrreparable);

      let message = "Devolución registrada exitosamente";
      if (preDamageType === "irreparable") {
        message += " - Herramienta dada de baja";
      } else if (preDamageType === "leve" && amount > 0) {
        message += " - Daño leve registrado";
      }
      
      showNotification(message, "success");
      setOpenPreReturn(false);
      setPreDamageAmount("0");
      setPreIrreparable(false);
      setPreDamageType("none");
      setSelectedLoanId(null);
      loadAll();
    } catch (error) {
      showNotification("Error al registrar devolución", "error");
    }
  };

  const handleOpenConfirm = (loanId) => {
    setSelectedLoanId(loanId);
    setOpenConfirm(true);
  };

  const handlePayDebts = async () => {
    if (!selectedLoanId) return;
    
    try {
      await loanService.payDebts(selectedLoanId);
      showNotification("Deudas marcadas como pagadas", "success");
      setOpenConfirm(false);
      setSelectedLoanId(null);
      loadPendingPayment();
    } catch (error) {
      showNotification("Error al procesar pago", "error");
    }
  };

  /* ---------- FUNCIONES DE ORDENAMIENTO Y BÚSQUEDA ---------- */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Verificar si préstamo está vencido
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return dayjs(dueDate).isBefore(dayjs());
  };

  // Verificar si préstamo está por vencer (menos de 24h)
  const isDueSoon = (dueDate) => {
    if (!dueDate || isOverdue(dueDate)) return false;
    const due = dayjs(dueDate);
    const now = dayjs();
    const hoursUntilDue = due.diff(now, 'hour');
    return hoursUntilDue > 0 && hoursUntilDue <= 24;
  };

  // Filtrar y ordenar préstamos
  const sortedLoans = useMemo(() => {
    let filtered = [...loans];
    
    // Aplicar filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(loan =>
        loan.customerName?.toLowerCase().includes(term) ||
        loan.toolName?.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de estado
    if (filterStatus !== "TODOS") {
      filtered = filtered.filter(loan => {
        if (filterStatus === "VENCIDO") return isOverdue(loan.dueDate);
        if (filterStatus === "POR_VENCER") return isDueSoon(loan.dueDate);
        if (filterStatus === "ACTIVO") return !isOverdue(loan.dueDate) && !isDueSoon(loan.dueDate);
        return true;
      });
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Manejar fechas
      if (sortField === "loanDate" || sortField === "dueDate") {
        aValue = dayjs(aValue);
        bValue = dayjs(bValue);
      }
      
      // Manejar strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [loans, sortField, sortDirection, searchTerm, filterStatus]);

  // Estadísticas
  const stats = {
    totalActive: loans.length,
    totalDebts: debts.length,
    totalDebtAmount: debts.reduce((sum, d) => sum + (d.fineAmount || 0) + (d.damageCharge || 0), 0),
    overdueLoans: loans.filter(l => isOverdue(l.dueDate)).length,
    dueSoonLoans: loans.filter(l => isDueSoon(l.dueDate)).length
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "Sin fecha";
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Formato de moneda
  const formatCurrency = (amount) => {
    return `$${(amount || 0).toLocaleString()}`;
  };

  return (
     <BaseLayout>
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
          <Tooltip title="Actualizar datos">
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={loadAll}
              disabled={loading}
              size="small"
            >
              Actualizar
            </Button>
          </Tooltip>
          <Tooltip title="Registrar nuevo préstamo">
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
          </Tooltip>
        </Stack>
      </Box>

      {/* Estadísticas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
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
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#f44336" }}>
                {stats.overdueLoans}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vencidos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#ff9800" }}>
                {stats.dueSoonLoans}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Por Vencer
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#9c27b0" }}>
                {stats.totalDebts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Con Deudas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h4" sx={{ color: "#4caf50" }}>
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
      <Card sx={{ mb: 4, border: '1px solid #e0e0e0', flex: 1 }}>
        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ color: "#6c63ff", display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon /> Préstamos Activos
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* Barra de búsqueda */}
              <TextField
                placeholder="Buscar por cliente o herramienta..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 250 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} />
                }}
              />
              
              {/* Filtro de estado */}
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterStatus}
                  label="Estado"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="TODOS">Todos</MenuItem>
                  <MenuItem value="ACTIVO">Activos</MenuItem>
                  <MenuItem value="POR_VENCER">Por Vencer</MenuItem>
                  <MenuItem value="VENCIDO">Vencidos</MenuItem>
                </Select>
              </FormControl>
              
              <Chip 
                label={`${sortedLoans.length} activos`} 
                sx={{ 
                  backgroundColor: '#6c63ff',
                  color: 'white',
                  fontWeight: 'bold'
                }}
                size="small" 
              />
            </Box>
          </Box>
          
          <ScrollableTable maxHeight="400px">
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
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SortIcon fontSize="small" />
                      <Button 
                        size="small" 
                        onClick={() => handleSort("customerName")}
                        sx={{ color: 'white', textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Cliente {sortField === "customerName" && (sortDirection === "asc" ? "↑" : "↓")}
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>Herramienta</TableCell>
                  <TableCell width="150px">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SortIcon fontSize="small" />
                      <Button 
                        size="small" 
                        onClick={() => handleSort("loanDate")}
                        sx={{ color: 'white', textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Fecha Préstamo {sortField === "loanDate" && (sortDirection === "asc" ? "↑" : "↓")}
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell width="150px">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SortIcon fontSize="small" />
                      <Button 
                        size="small" 
                        onClick={() => handleSort("dueDate")}
                        sx={{ color: 'white', textTransform: 'none', fontWeight: 'bold' }}
                      >
                        Fecha Entrega {sortField === "dueDate" && (sortDirection === "asc" ? "↑" : "↓")}
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell width="100px">Estado</TableCell>
                  <TableCell width="120px">Acciones</TableCell>
                </TableRow>
              </TableHead>
              
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>Cargando préstamos...</Typography>
                    </TableCell>
                  </TableRow>
                ) : sortedLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <InventoryIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                      <Typography color="text.secondary">
                        {searchTerm || filterStatus !== "TODOS" 
                          ? "No se encontraron préstamos con ese criterio" 
                          : "No hay préstamos activos"}
                      </Typography>
                      {(searchTerm || filterStatus !== "TODOS") && (
                        <Button 
                          size="small" 
                          onClick={() => {
                            setSearchTerm("");
                            setFilterStatus("TODOS");
                          }}
                          sx={{ mt: 1 }}
                        >
                          Limpiar filtros
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLoans.map((loan) => (
                    <TableRow 
                      key={loan.id} 
                      hover 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f5f0ff' },
                        backgroundColor: isOverdue(loan.dueDate) ? '#ffebee' : 
                                         isDueSoon(loan.dueDate) ? '#fff8e1' : 'inherit'
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
                        color: isOverdue(loan.dueDate) ? '#f44336' : 
                               isDueSoon(loan.dueDate) ? '#ff9800' : 'inherit',
                        fontWeight: (isOverdue(loan.dueDate) || isDueSoon(loan.dueDate)) ? 'bold' : 'normal'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon fontSize="small" />
                          {formatDate(loan.dueDate)}
                          {isDueSoon(loan.dueDate) && (
                            <Typography variant="caption" sx={{ ml: 1, color: '#ff9800' }}>
                              ⏰
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          label={
                            isOverdue(loan.dueDate) ? "VENCIDO" : 
                            isDueSoon(loan.dueDate) ? "POR VENCER" : "ACTIVO"
                          } 
                          size="small"
                          sx={{
                            backgroundColor: isOverdue(loan.dueDate) ? '#f44336' : 
                                             isDueSoon(loan.dueDate) ? '#ff9800' : '#4caf50',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem'
                          }}
                          icon={
                            isOverdue(loan.dueDate) ? <WarningIcon /> : 
                            isDueSoon(loan.dueDate) ? <ScheduleIcon /> : <CheckCircleIcon />
                          }
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip title="Registrar devolución">
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
          </ScrollableTable>
        </CardContent>
      </Card>

      {/* ---------- PENDIENTES DE PAGO ---------- */}
      <Card sx={{ border: '1px solid #e0e0e0', mt: 2 }}>
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
          
          <ScrollableTable maxHeight="400px">
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ 
                  '& th': { 
                    backgroundColor: '#f44336', 
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
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
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                      <Typography sx={{ mt: 1, fontSize: '0.9rem' }}>Cargando deudas...</Typography>
                    </TableCell>
                  </TableRow>
                ) : debts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <PaidIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                        <Typography color="text.secondary">No hay deudas pendientes</Typography>
                      </Box>
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
                          <Tooltip title="Marcar deudas como pagadas">
                            <Button
                              size="small"
                              variant="contained"
                              startIcon={<PaidIcon />}
                              onClick={() => handleOpenConfirm(debt.id)}
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
          </ScrollableTable>
          
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
                Total deuda pendiente: <strong>{formatCurrency(stats.totalDebtAmount)}</strong>
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
              label="Cliente *"
              value={form.customerId}
              onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              fullWidth
              required
              margin="normal"
              error={!!formErrors.customerId}
              helperText={formErrors.customerId}
            >
              <MenuItem value="">
                -- Seleccionar cliente --
              </MenuItem>
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ‑ {c.rut}
                  {c.debt && c.debt > 0 && ` (Deuda: $${c.debt.toLocaleString()})`}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField 
              select 
              label="Grupo de Herramientas *"
              value={form.toolGroupId}
              onChange={(e) => setForm({ ...form, toolGroupId: e.target.value })}
              fullWidth
              required
              margin="normal"
              error={!!formErrors.toolGroupId}
              helperText={formErrors.toolGroupId}
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
                label="Fecha de Entrega Pactada *"
                value={form.dueDate}
                onChange={(newVal) => setForm({ ...form, dueDate: newVal })}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    margin: "normal",
                    helperText: formErrors.dueDate || "Fecha límite para la devolución",
                    error: !!formErrors.dueDate
                  } 
                }}
                minDateTime={dayjs().add(1, 'hour')}
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
              label="Estado de la Herramienta *"
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
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            )}
            
            {preDamageType === "irreparable" && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Atención: Esta acción no se puede deshacer
                </Typography>
                <Typography variant="body2">
                  • La herramienta será dada de baja permanentemente<br/>
                  • Se cobrará el valor de reposición al cliente<br/>
                  • Se actualizará el inventario automáticamente
                </Typography>
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
            {preDamageType === "irreparable" ? "Confirmar Baja" : 
             preDamageType === "leve" ? "Registrar con Daño" : "Confirmar Devolución"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmación para pagar deudas */}
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} maxWidth="sm">
        <DialogTitle>Confirmar Pago de Deudas</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de marcar estas deudas como pagadas?
            <br/><br/>
            Esta acción:
            <ul>
              <li>Actualizará el estado financiero del cliente</li>
              <li>Eliminará las restricciones por deudas pendientes</li>
              <li>No se puede deshacer</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} sx={{ color: "#666" }}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePayDebts} 
            variant="contained" 
            color="success"
            startIcon={<PaidIcon />}
          >
            Confirmar Pago
          </Button>
        </DialogActions>
      </Dialog>
    </BaseLayout>
  );
};

export default LoanView;