export const getTransactionTotals = async (token, days) => {
  return fetch("/api/transaction/getTransactions/Totals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ days: days }),
  }).then((response) => response.json());
};

export const getTransactionList = async (
  token,
  page = 1,
  PAGE_SIZE,
  search,
) => {
  return fetch(
    `/api/transaction/getTransactions/List?page=${page}&limit=${PAGE_SIZE}&search=${search}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    },
  ).then((response) => response.json());
};

export const getTransactionGroups = async (token, options = {}) => {
  return fetch("/api/transaction/getTransactions/Groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(options),
  }).then((response) => response.json());
};

export const deleteUserTransactions = async (token) => {
  return fetch("/api/transaction/deleteUserTransactions", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};
