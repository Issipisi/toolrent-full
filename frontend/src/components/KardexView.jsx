import { useEffect, useState } from "react";
import kardexService from "../services/kardex.service";
import toolGroupService from "../services/toolGroup.service"; // para combo
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const KardexView = () => {
  /* ---------- ESTADOS ---------- */
  const [rows, setRows] = useState([]);
  const [tools, setTools] = useState([]); // combo
  const [selectedTool, setSelectedTool] = useState("");
  const [from, setFrom] = useState(dayjs().subtract(1, 'month'));
  const [to, setTo] = useState(dayjs());

  /* ---------- CARGAS INICIALES ---------- */
  useEffect(() => {
    /* tabla general al entrar */
    kardexService.getAll().then((res) => setRows(res.data));
    /* combo de herramientas */
    toolGroupService.getAll().then((res) => setTools(res.data));
  }, []);

  /* ---------- FILTROS ---------- */
  const filterByTool = async () => {
    if (!selectedTool) return;
    const res = await kardexService.byTool(selectedTool);
    setRows(res.data);
    console.log('Kardex filtrado →', res.data);
  };

  const filterByRange = async () => {
    const res = await kardexService.byRange(
      from.format('YYYY-MM-DD'),
      to.format('YYYY-MM-DD')
    );
    setRows(res.data);
  };

  const clearFilters = () => {
    kardexService.getAll().then((res) => setRows(res.data));
    setSelectedTool("");
  };

  /* ---------- RENDER ---------- */
  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#6c63ff" }}>
        Kardex Movements
      </Typography>

      {/* ---------- FILTROS ---------- */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>

        {/* Filtro por herramienta (RF5.2) */}
        <TextField
          select
          label="Filtro por Herramienta"
          value={selectedTool}
          onChange={(e) => setSelectedTool(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          <MenuItem value="">-- All --</MenuItem>
          {tools.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name} ({t.category})
            </MenuItem>
          ))}
        </TextField>

        {/* Filtro por rango (RF5.3) */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack direction="row" spacing={1}>
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

        {/* Botones */}
        <Button variant="outlined" onClick={filterByTool}>Filtro x Herramienta</Button>
        <Button variant="outlined" onClick={filterByRange}>Filtro x Fechas</Button>
        <Button variant="outlined" onClick={clearFilters}>Clear</Button>
      </Stack>

      {/* ---------- TABLA ---------- */}
      <TableContainer>
        <Table>
          <TableHead sx={{ background: "#f5f0ff" }}>
            <TableRow>
              <TableCell sx={{ color: "#2e2e4e" }}>ID</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Fecha</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Tipo</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Herramienta</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Cliente</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Detalles</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover sx={{ "&:hover": { background: "#f5f0ff" } }}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.movementDate}</TableCell>
                <TableCell>{r.movementType}</TableCell>
                <TableCell>{r.toolUnit?.toolGroup?.name ?? ''}</TableCell>
                <TableCell>{r.customer?.name ?? ''}</TableCell>
                <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {r.details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default KardexView;