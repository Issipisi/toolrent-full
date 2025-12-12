import api from "../http-common";

const activeLoans = (from, to) => api.get("/reports/active-loans", {
  params: { from, to }
});
const topTools = (from, to) => api.get("/reports/top-tools", {
  params: { from, to }
});
const customersWithDebt = () => api.get("/reports/customers-with-debt");

const overdueCustomers = () => api.get("/reports/overdue-customers");


export default { activeLoans, overdueCustomers, customersWithDebt, topTools };