import api from "../http-common";

const getAll = () => api.get("/tools");

const register = (name, category, replacementValue, pricePerDay, stock) =>
  api.post("/tools", null, {
    params: { name, category, replacementValue, pricePerDay, stock },
  });

const getAvailable = () => api.get("/tools/available");

const updateTariff = (toolGroupId, dailyRentalRate, dailyFineRate) =>
  api.put(`/tools/${toolGroupId}/tariff`, null, {
    params: { dailyRentalRate, dailyFineRate },
  });

const updateReplacementValue = (toolGroupId, replacementValue) =>
  api.put(`/tools/${toolGroupId}/replacement-value`, null, {
    params: { replacementValue }
  });


export default { getAll, register, getAvailable, updateTariff, updateReplacementValue};
