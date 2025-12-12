import api from "../http-common";

const getAll = () => api.get("/kardex");

const byTool = (toolGroupId) => api.get(`/kardex/by-tool`, { params: { toolGroupId } });

const byRange = (from, to) => api.get(`/kardex/by-range`, { params: { from, to } });

export default { getAll, byTool, byRange };