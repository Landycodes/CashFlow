// route to get logged in user's info (needs the token)
export const getMe = (token) => {
  return fetch("/api/me", {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
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

export const googleLogin = (results) => {
  return fetch("/api/firebase/googlesignin", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(results),
  });
  // .then((response) => {
  //   if (response.status === 400) {
  //     return response.json();
  //   } else {
  //     return response;
  //   }
  // });
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
