// TODO add JWT auth token methods to apis

// ****************** USER ROUTES *******************
export const getMe = async (token) => {
  return fetch("/api/me", {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((data) => {
    if (data.status === 200) {
      return data.json();
    }
  });
};

export const createUser = async (userData) => {
  return fetch("/api/newuser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (userData) => {
  return fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (user_id, updatedObject) => {
  return fetch(`/api/update/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedObject),
  }).then((response) => response.json());
};

// ****************** GOOGLE SIGN IN ROUTE *******************
export const googleLogin = async (results) => {
  return fetch("/api/firebase/googlesignin", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(results),
  });
};

// ****************** PLAID ROUTES *******************
export const createPlaidLinkToken = async (token) => {
  return fetch("/api/plaid/create_link_token", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};

export const exchangeAndSavePlaidToken = async (token, public_token) => {
  try {
    return fetch("/api/plaid/exchange_PublicToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ public_token: public_token }),
    }).then((res) => res.json());
  } catch (error) {
    return error;
  }
};

export const fetchAccountData = async (token) => {
  return fetch("/api/plaid/fetchAccountData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};

export const getRecurringTransactions = async (token) => {
  console.log("Fetching recurring transactions");
  return fetch("/api/plaid/getrecurringTransactions", {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};

// ****************** TRANSACTION ROUTES *******************
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

export const getTransactionList = async (token) => {
  return fetch("/api/transaction/getTransactions/List", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};

export const getTransactionGroups = async (token, days) => {
  return fetch("/api/transaction/getTransactions/Groups", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ days: days }),
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

// ****************** ACCOUNT ROUTES *******************
export const getBills = async (user_id, account_id) => {
  return fetch(`/api/account/getBills/${user_id}/${account_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
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
