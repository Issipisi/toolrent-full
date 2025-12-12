import { useEffect, useState } from "react";
import toolGroupService from "../services/toolGroup.service";
import {
  Button, Paper, TextField, Typography, Stack, MenuItem,
} from "@mui/material";

const TariffView = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  // Tarifas del grupo
  const [groupRent, setGroupRent] = useState("");
  const [groupFine, setGroupFine] = useState("");

  // Valor de reposición
  const [replacementValue, setReplacementValue] = useState("");

  useEffect(() => {
    toolGroupService.getAll().then((res) => setGroups(res.data));
  }, []);

  const loadGroupData = async (groupId) => {
    const g = groups.find((gr) => gr.id === groupId);
    if (!g) return;
    setGroupRent(g.tariff.dailyRentalRate);
    setGroupFine(g.tariff.dailyFineRate);
    setReplacementValue(g.replacementValue);

  };

  const saveGroupTariff = async () => {
    if (!selectedGroup) return;
    try {
      await toolGroupService.updateTariff(selectedGroup, parseFloat(groupRent), parseFloat(groupFine));
      alert("Tarifa actualizada");
    } catch (e) {
      alert("Error: " + (e.response?.data || "Update failed"));
    }
  };

  const saveReplacementValue = async () => {
    if (!selectedGroup) return;
    try {
      await toolGroupService.updateReplacementValue(selectedGroup, parseFloat(replacementValue));
      alert("Valor de reposición actualizado");
      const res = await toolGroupService.getAll();
      setGroups(res.data);
    } catch (e) {
      alert("Error: " + (e.response?.data || "Update failed"));
    }
  };

  return (
    <Paper sx={{ p: 4, background: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" sx={{ mb: 3, color: "#6c63ff", textAlign: "center" }}>
        Editar Grupo Configuración 
      </Typography>

      <Stack spacing={3} sx={{ width: "100%", maxWidth: 400, alignItems: "center" }}>
        {/* Selector de grupo */}
        <TextField
          select
          label="Seleccionar Herramienta"
          value={selectedGroup}
          onChange={(e) => {
            setSelectedGroup(e.target.value);
            loadGroupData(e.target.value);
          }}
          fullWidth
        >
          <MenuItem value="">-- Seleccionar --</MenuItem>
          {groups.map((g) => (
            <MenuItem key={g.id} value={g.id}>
              {g.name} ({g.category})
            </MenuItem>
          ))}
        </TextField>

        {/* Tarifas del grupo */}
        <TextField label="Tarifa Renta Dairia ($)" type="number" value={groupRent} onChange={(e) => setGroupRent(e.target.value)} fullWidth />
        <TextField label="Tarifa Multa Diaria ($)" type="number" value={groupFine} onChange={(e) => setGroupFine(e.target.value)} fullWidth />
        <Button variant="contained" onClick={saveGroupTariff}>Guardar Tarifa</Button>

        {/* Valor de reposición */}
        <TextField label="Valor de Reposición ($)" type="number" value={replacementValue} onChange={(e) => setReplacementValue(e.target.value)} fullWidth />
        <Button variant="contained" onClick={saveReplacementValue}>Guardar Valor de Reposición</Button>

      </Stack>
    </Paper>
  );
};

export default TariffView;