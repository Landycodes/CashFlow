export const getSingleAccount = async (token) => {
  return fetch("/api/account/getAccount", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};
export const getBills = async (token) => {
  return fetch("/api/recurring/getRecurringBills", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};

export const addBill = async (user_id, account_id, billName) => {
  return fetch(`/api/account/addbill/${user_id}/${account_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ billName: billName }),
  }).then((response) => response.json());
};

export const removeBill = async (user_id, account_id, billName) => {
  return fetch(`/api/account/deleteBill/${user_id}/${account_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ billName: billName }),
  }).then((response) => response.json());
};

export const removeAllAccounts = async (token) => {
  return fetch("/api/account/removeAllAccounts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
}; // Make it delete specific accounts later
