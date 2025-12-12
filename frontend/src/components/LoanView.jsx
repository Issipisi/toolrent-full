import React, { useEffect, useState } from "react";
import loanService from "../services/loan.service";
import customerService from "../services/customer.service";
import toolGroupService from "../services/toolGroup.service";
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography,
  MenuItem, Stack,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const LoanView = () => {
  const [loans, setLoans] = useState([]);
  const [debts, setDebts] = useState([]);
  const [open, setOpen] = useState(false);
  const [openPreReturn, setOpenPreReturn] = useState(false);
  const [preDamageAmount, setPreDamageAmount] = useState("0");
  const [preIrreparable, setPreIrreparable] = useState(false);
  const [preDamageType, setPreDamageType] = useState("none");

  const [customers, setCustomers] = useState([]);
  const [tools, setTools] = useState([]);
  const [form, setForm] = useState({
    customerId: "",
    toolGroupId: "",
    dueDate: dayjs(),
  });

  /* ---------- CARGAS ---------- */
  const loadActive = async () => {
    const res = await loanService.getActive();
    setLoans(res.data);
  };

  const loadPendingPayment = async () => {
    const res = await loanService.getPendingPayment();
    setDebts(res.data);
  };

  const loadCustomers = async () => {
    const res = await customerService.getActive();
    setCustomers(res.data);
  };

  const loadTools = async () => {
    const res = await toolGroupService.getAvailable();
    setTools(res.data);
  };

  useEffect(() => {
    loadActive();
    loadPendingPayment();
    loadCustomers();
    loadTools();

    // ➜ Escucha cuando ToolUnitView retire una unidad
    const handleDebtUpdate = () => {
      loadPendingPayment(); // recarga solo deudas
    };
    window.addEventListener("debtUpdated", handleDebtUpdate);

    // Limpieza al desmontar
    return () => window.removeEventListener("debtUpdated", handleDebtUpdate);
  }, []);

  /* ---------- HANDLERS ---------- */
  const handleRegister = async () => {
    try {
      await loanService.register(
        form.toolGroupId,
        form.customerId,
        form.dueDate.format("YYYY-MM-DDTHH:mm:ss")
      );
      alert("Préstamo registrado");
      setOpen(false);
      setForm({ customerId: "", toolGroupId: "", dueDate: dayjs() });
      loadActive();
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data || "Error desconocido";
      alert("No se puede registrar: " + msg);
    }
  };

  const handlePreReturn = async (loanId) => {
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
      // 1. Registrar devolución
      await loanService.returnLoan(loanId, amount, preIrreparable);

      // 2. Si hay daño leve → mandar directamente a reparación
      if (preDamageType === "leve" && amount > 0) {
        // Buscamos el préstamo para obtener el toolUnitId
        const loanRes = await loanService.getActive();
        const loan = loanRes.data.find(l => l.id == loanId);
        if (loan?.toolUnitId) {
          await loanService.sendToRepair(loan.toolUnitId);
        }
      }

      alert("Devolución registrada");
      setOpenPreReturn(false);
      setPreDamageAmount("0");
      setPreIrreparable(false);
      setPreDamageType("none");
      loadActive();
      loadPendingPayment();
    } catch (e) {
      alert("Error: " + (e.response?.data || "Return failed"));
    }
  };

  const handlePayDebts = async (loanId) => {
    if (!confirm("¿Marcar como pagadas las deudas de este préstamo?")) return;
    try {
      await loanService.payDebts(loanId);
      alert("Deudas pagadas");
      loadPendingPayment();
    } catch (e) {
      alert("Error: " + (e.response?.data || "Payment failed"));
    }
  };

  /* ---------- RENDER ---------- */
  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#6c63ff" }}>Gestión de Préstamos</Typography>

      <Button variant="contained" sx={{ mb: 3 }} onClick={() => setOpen(true)}>
        Registrar Préstamo
      </Button>

      {/* ---------- PRÉSTAMOS ACTIVOS ---------- */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2, color: "#6c63ff" }}>Préstamos Activos</Typography>
      <TableContainer>
        <Table>
          <TableHead sx={{ background: "#f5f0ff" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Herramienta</TableCell>
              <TableCell>Fecha préstamo</TableCell>
              <TableCell>Fecha entrega</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loans.map((l) => (
              <TableRow key={l.id} hover>
                <TableCell>{l.id}</TableCell>
                <TableCell>{l.customerName}</TableCell>
                <TableCell>{l.toolName}</TableCell>
                <TableCell>{dayjs(l.loanDate).format("DD-MM-YYYY")}</TableCell>
                <TableCell>{dayjs(l.dueDate).format("DD-MM-YYYY")}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => handlePreReturn(l.id)}>Devolver</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ---------- PENDIENTES DE PAGO ---------- */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2, color: "#b90303ff" }}>Pendientes de Pago</Typography>
      <TableContainer>
        <Table>
          <TableHead sx={{ background: "#f8c1c1ff" }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Herramienta</TableCell>
              <TableCell>Fecha devolución</TableCell>
              <TableCell>Multa ($)</TableCell>
              <TableCell>Daño ($)</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {debts.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>{d.id}</TableCell>
                <TableCell>{d.customerName}</TableCell>
                <TableCell>{d.toolName}</TableCell>
                <TableCell>{dayjs(d.returnDate).format("DD-MM-YYYY HH:mm")}</TableCell>
                <TableCell>{d.fineAmount || 0}</TableCell>
                <TableCell>{d.damageCharge || 0}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" color="success" onClick={() => handlePayDebts(d.id)}>Pagar</Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Nuevo Préstamo */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" 
        fullWidth
          disableScrollLock={false}
          sx={{ marginTop: 2 }} // deja espacio arriba
          PaperProps={{
            sx: {
              alignSelf: 'flex-start', // se ubica arriba, no al centro
              mt: 2,                   // separación desde la parte superior
            },
          }}>
        <DialogTitle sx={{ background: "#f5f0ff", color: "#6c63ff" }}>Nuevo Préstamo</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField select label="Cliente" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} fullWidth>
            {customers
              .filter((c) => c.name !== "Sistema") // ← excluye al usuario sistema
              .map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ‑ {c.rut}
                </MenuItem>
              ))}
          </TextField>
          <TextField select label="Grupo de Herramientas" value={form.toolGroupId} onChange={(e) => setForm({ ...form, toolGroupId: e.target.value })} fullWidth>
            {tools.map((t) => (<MenuItem key={t.id} value={t.id}>{t.name} ({t.category})</MenuItem>))}
          </TextField>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Fecha de Entrega"
              value={form.dueDate}
              onChange={(newVal) => setForm({ ...form, dueDate: newVal })}
              minutesStep={5}              // ← todos los minutos
              ampm={true}                 // formato 12 h
              slotProps={{ textField: { fullWidth: true } }}
              desktopModeMediaQuery="@media (pointer: fine)" // vista desktop completa
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ color: "#4a4a68" }}>Cancelar</Button>
          <Button onClick={handleRegister} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal previo a devolución – daño opcional */}
      <Dialog open={openPreReturn} onClose={() => setOpenPreReturn(false)} maxWidth="xs">
        <DialogTitle>Registrar Devolución</DialogTitle>
        <DialogContent>
          <Typography>¿Hubo daño en la herramienta?</Typography>
          <br />
          <TextField
            select
            label="Tipo de daño"
            fullWidth
            value={preDamageType}
            onChange={handleDamageTypeChange}
            sx={{ mb: 2 }}
          >
            <MenuItem value="none">Sin daño</MenuItem>
            <MenuItem value="leve">Leve (ingresar monto)</MenuItem>
            <MenuItem value="irreparable">Irreparable (valor reposición)</MenuItem>
          </TextField>
          {preDamageType === "leve" && (
            <TextField
              label="Monto del daño leve ($)"
              type="number"
              fullWidth
              value={preDamageAmount}
              onChange={(e) => setPreDamageAmount(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreReturn(false)}>Cancelar</Button>
          <Button onClick={handleConfirmReturn} variant="contained" color="primary">Confirmar Devolución</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default LoanView;