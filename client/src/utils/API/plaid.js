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
    }).then((res) => res.status);
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
  }).then((response) => response.status);
};
