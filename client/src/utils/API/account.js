export const createAccount = async (token, body) => {
  return fetch("/api/account/createAccount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  }).then((response) => response.json());
};

export const getSingleAccount = async (token) => {
  return fetch("/api/account/getAccount", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};

export const getAccounts = async (token) => {
  return fetch("/api/account/getAllAccounts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};
// export const getBills = async (token) => {
//   return fetch("/api/recurring/getRecurringBills", {
//     method: "GET",
//     headers: {
//       "Content-Type": "application/json",
//       authorization: `Bearer ${token}`,
//     },
//   }).then((response) => response.json());
// };

// export const addBill = async (user_id, account_id, billName) => {
//   return fetch(`/api/account/addbill/${user_id}/${account_id}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ billName: billName }),
//   }).then((response) => response.json());
// };

// export const removeBill = async (user_id, account_id, billName) => {
//   return fetch(`/api/account/deleteBill/${user_id}/${account_id}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ billName: billName }),
//   }).then((response) => response.json());
// };

export const removeAllAccounts = async (token) => {
  return fetch("/api/account/removeAllAccounts", {
    method: "DELETE",
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.ok);
}; // Make it delete specific accounts later
