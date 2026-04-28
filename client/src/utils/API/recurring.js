export const getNextRecurring = async (token) => {
  return fetch("/api/recurring/getNextRecurring", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};

export const getRecurringCalEvents = async (token) => {
  return fetch("/api/recurring/getRecurringCalEvents", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  }).then((response) => response.json());
};
export const getAllRecurring = async (token, options = {}) => {
  return fetch("/api/recurring/getAllRecurring", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(options),
  }).then((response) => response.json());
};
