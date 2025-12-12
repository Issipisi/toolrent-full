import api from "../http-common";

const getAllWithDetails = () => api.get("/tools/units"); 

const statusMap = {
  EN_REPARACION: "IN_REPAIR",
  DADA_DE_BAJA: "RETIRED",
};

const changeStatus = (unitId, newStatus) =>
  api.put(`/tools/units/${unitId}/status`, null, {
    params: { newStatus: statusMap[newStatus] || newStatus }
  });

const resolveRepair = (unitId, retire) =>
  api.put(`/tools/units/${unitId}/repair-resolution`, null, {
    params: { retire }
  });

const retireFromRepair = (unitId) =>
  api.put(`/tools/units/${unitId}/retire-from-repair`);

export default { getAllWithDetails, changeStatus, resolveRepair, retireFromRepair };