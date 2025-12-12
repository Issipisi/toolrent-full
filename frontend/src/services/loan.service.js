import api from "../http-common";

const register = (toolGroupId, customerId, dueDate) =>
  api.post("/loans", null, {
    params: { toolGroupId, customerId, dueDate },
  });

const getActive = (from, to) =>
  api.get("/loans/active", { params: { from, to } });

const returnLoan = (loanId, damageCharge = 0.0, irreparable = false) =>
  api.put(`/loans/${loanId}/return`, null, {
    params: { damageCharge, irreparable }
  });

const applyDamage = (loanId, amount, irreparable = false) =>
  api.put(`/loans/${loanId}/damage`, null, {
    params: { amount, irreparable }
  });

const payDebts = (loanId) =>
  api.put(`/loans/${loanId}/pay-debts`);

const getReturnedWithDebts = () => 
  api.get("/loans/returned-with-debts");

const getPendingPayment = () =>
  api.get("/loans/pending-payment");

const sendToRepair = (unitId) =>
  api.put(`/tools/units/${unitId}/repair-resolution`, null, {
    params: { retire: false }
  });

export default { register, getActive, returnLoan, applyDamage, payDebts, 
  getReturnedWithDebts, getPendingPayment, sendToRepair};