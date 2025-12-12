import { useEffect, useState } from "react";
import toolGroupService from "../services/toolGroup.service";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Stack, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const ToolGroupView = () => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({ name: "", category: "", replacementValue: "", pricePerDay: "", stock: "" });

  const loadGroups = async () => {
    const res = await toolGroupService.getAll();
    setGroups(res.data);
  };

  const handleRegister = async () => {
    try {
      await toolGroupService.register(
        form.name,
        form.category,
        parseFloat(form.replacementValue),
        parseFloat(form.pricePerDay),
        parseInt(form.stock)
      );
      alert("Tool group created successfully");
      setOpen(false);
      setForm({ name: "", category: "", replacementValue: "", pricePerDay: "", stock: "" });
      loadGroups();
    } catch (e) {
      alert("Error: " + (e.response?.data || "Tool group creation failed"));
    }
  };


  useEffect(() => { loadGroups(); }, []);

  return (
    <Paper sx={{ p: 4, background: "#ffffff" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#6c63ff" }}>Tool Groups</Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>Register Group</Button>

      <TableContainer sx={{ mt: 3 }}>
        <Table>
          <TableHead sx={{ background: "#f5f0ff" }}>
            <TableRow>
              <TableCell sx={{ color: "#2e2e4e" }}>Nombre</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Categoría</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Reemplazo</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Tarifa diaria</TableCell>
              <TableCell sx={{ color: "#2e2e4e" }}>Stock Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((g) => (
              <TableRow key={g.id} hover sx={{ "&:hover": { background: "#f5f0ff" } }}>
                <TableCell>{g.name}</TableCell>
                <TableCell>{g.category}</TableCell>
                <TableCell>{g.replacementValue}</TableCell>
                <TableCell>{g.tariff?.dailyRentalRate}</TableCell>
                <TableCell>{g.units.filter(u => u.status === "AVAILABLE").length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal registro */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ background: "#f5f0ff", color: "#6c63ff" }}>Nueva Herramienta</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <TextField label="Valor de Reemplazo" type="number" value={form.replacementValue} onChange={(e) => setForm({ ...form, replacementValue: e.target.value })} />
          <TextField label="Tarifa diaria" type="number" value={form.pricePerDay} onChange={(e) => setForm({ ...form, pricePerDay: e.target.value })} />
          <TextField label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ color: "#4a4a68" }}>Cancel</Button>
          <Button onClick={handleRegister} variant="contained" sx={{ background: "#6c63ff", ":hover": { background: "#c77dff" } }}>Save</Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};

export default ToolGroupView;