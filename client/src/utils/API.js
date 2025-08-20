// TODO add JWT auth token methods to apis

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

export const updateUser = (user_id, updatedObject) => {
  return fetch(`/api/update/${user_id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedObject),
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

export const exchangeAndSavePlaidToken = async (user_id, public_token) => {
  try {
    /* const exchangedToken = */ return fetch(
      `/api/plaid/exchange_PublicToken/${user_id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      }
    ).then((res) => res.json());

    // return updateUser(user_id, {
    //   plaidAccessToken: exchangedToken.accessToken,
    // }).then((response) => response.json);
  } catch (error) {
    return error;
  }
};

export const fetchAccountData = (user_id, accessToken) => {
  return fetch(`/api/plaid/fetchAccountData/${user_id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: accessToken }),
  }).then((response) => response.json());
};

export const getTransactions = (user_id, account_id) => {
  return fetch(`/api/transaction/getTransactions/${user_id}/${account_id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  }).then((response) => response.json());
};
