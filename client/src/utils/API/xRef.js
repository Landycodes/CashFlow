export const setReferenceName = async (token, refData) => {
  return fetch("/api/xref/setName", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ refData: refData }),
  }).then((response) => response.json());
};
