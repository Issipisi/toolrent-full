import api from "../http-common";

const getAll = () => api.get("/tariffs");
const update = (dailyRentalRate, dailyFineRate) =>
  api.put("/tariffs", null, { params: { dailyRentalRate, dailyFineRate } });

export default { getAll, update };