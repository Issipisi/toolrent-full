import { useState } from "react";
import reportService from "../services/report.service";
import {
  Button, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Typography, Stack, TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const ReportView = () => {
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");

  /* ---------- FECHOS (solo para activos y top-tools) ---------- */
  const [from, setFrom] = useState(dayjs().subtract(1, 'month'));
  const [to, setTo] = useState(dayjs());

  /* ---------- LLAMADAS ---------- */
  const loadActive = async () => {
    try {
      const res = await reportService.activeLoans(
        from.startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        to.endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      );
      setData(res.data);
      setTitle("Préstamos Activos");
    } catch (error) {
      console.error('Error loading active loans:', error);
      alert('Error al cargar préstamos activos');
    }
  };

  const loadTop = async () => {
    try {
      const res = await reportService.topTools(
        from.startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
        to.endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      );
      setData(res.data);
      setTitle("Herramientas más solicitadas");
    } catch (error) {
      console.error('Error loading top tools:', error);
      alert('Error al cargar herramientas más solicitadas');
    }
  };

  const loadCustomersWithDebt = async () => {
    const res = await reportService.customersWithDebt();
    setData(res.data);
    setTitle("Clientes con deudas");
  };

  /* ---------- RENDER ---------- */
  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#6c63ff" }}>
        Reports
      </Typography>

      {/* Selector de fechas (solo para activos y top-tools) */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <DatePicker
            label="Desde"
            value={from}
            onChange={(newVal) => setFrom(newVal ?? dayjs())}
            renderInput={(params) => <TextField {...params} />}
          />
          <DatePicker
            label="Hasta"
            value={to}
            onChange={(newVal) => setTo(newVal ?? dayjs())}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </LocalizationProvider>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={loadActive}>Préstamos Activos</Button>
        <Button variant="outlined" onClick={loadCustomersWithDebt}>Clientes con Deudas</Button>
        <Button variant="outlined" onClick={loadTop}>Top Herramientas</Button>
      </Stack>

      {data.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
          <TableContainer>
            <Table>
              <TableHead sx={{ background: "#f5f0ff" }}>
                <TableRow>
                  {title === "Préstamos Activos" && (
                    <>
                      <TableCell sx={{ color: "#2e2e4e" }}>ID</TableCell>
                      <TableCell sx={{ color: "#2e2e4e" }}>Cliente</TableCell>
                      <TableCell sx={{ color: "#2e2e4e" }}>Herramienta</TableCell>
                      <TableCell sx={{ color: "#2e2e4e" }}>Fecha Préstamo</TableCell>
                      <TableCell sx={{ color: "#2e2e4e" }}>Fecha Devolución</TableCell>
                      <TableCell sx={{ color: "#2e2e4e" }}>Estado</TableCell>
                    </>
                  )}
                  {title === "Clientes con deudas" && (
                    <>
                      <TableCell>ID</TableCell>
                      <TableCell>Nombre</TableCell>
                      <TableCell>RUT</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Deuda ($)</TableCell>
                      <TableCell>¿Atraso?</TableCell>
                      <TableCell>Fecha más antigua</TableCell>
                    </>
                  )}
                  {title === "Herramientas más solicitadas" && (
                    <>
                      <TableCell sx={{ color: "#2e2e4e" }}>Herramienta</TableCell>
                      <TableCell sx={{ color: "#2e2e4e" }}>N° solicitudes</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx} hover sx={{ "&:hover": { background: "#f5f0ff" } }}>
                    {title === "Préstamos Activos" && (
                      <>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.customerName}</TableCell>
                        <TableCell>{row.toolName}</TableCell>
                        <TableCell>{row.loanDate}</TableCell>
                        <TableCell>{row.dueDate}</TableCell>
                        <TableCell>{row.status}</TableCell>
                      </>
                    )}
                    {title === "Clientes con deudas" && (
                      <>
                        <TableCell>{row.customerId}</TableCell>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.rut}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.totalDebt}</TableCell>
                        <TableCell>{row.hasOverdueLoan ? "Sí" : "No"}</TableCell>
                        <TableCell>{row.oldestDueDate ? dayjs(row.oldestDueDate).format("DD-MM-YYYY") : "-"}</TableCell>
                      </>
                    )}
                    {title === "Herramientas más solicitadas" && (
                      <>
                        <TableCell>{row.toolGroupName}</TableCell>
                        <TableCell>{row.total}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );
};

export default ReportView;