export const googleLogin = async (results) => {
  return fetch("/api/firebase/googlesignin", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(results),
  });
};
