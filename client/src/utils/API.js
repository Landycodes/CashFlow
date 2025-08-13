export const getMe = (token) => {
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

export const createUser = (userData) => {
  return fetch("/api/newuser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

export const loginUser = (userData) => {
  return fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
};

export const updateUser = (user_id, key, value) => {
  return fetch(`/api/update/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [key]: value }),
  }).then((response) => response.json());
};

export const googleLogin = (results) => {
  return fetch("/api/firebase/googlesignin", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(results),
  });
};

export const createPlaidLinkToken = (id) => {
  return fetch("/api/plaid/create_link_token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ _id: id }),
  }).then((response) => response.json());
};

export const exchangeAndSavePlaidToken = async (public_token, user_id) => {
  try {
    const exchangedToken = await fetch("/api/plaid/exchange_PublicToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_token }),
    }).then((res) => res.json());

    return updateUser(user_id, "plaidAccessToken", exchangedToken.accessToken);
  } catch (error) {
    return error;
  }
};

export const getAccountBalance = (accessToken) => {
  return fetch("/api/plaid/getAccountBalance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: accessToken }),
  }).then((response) => response.json());
};

export const getTransactionHistory = (accessToken) => {
  return fetch("/api/plaid/getTransactionHistory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: accessToken }),
  }).then((response) => response.json());
};

export const fetchAccountData = (id, accessToken) => {
  return fetch("/api/plaid/fetchAccountData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: id, accessToken: accessToken }),
  }).then((response) => response.json());
};

export const addIncome = (token, income) => {
  return fetch("/api/addincome", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(income),
  });
};

export const addExpense = (token, expense) => {
  return fetch("/api/addexpense", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(expense),
  });
};
