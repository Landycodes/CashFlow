import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import Auth from "../../utils/auth";
import { getMe } from "../../utils/API";

export default function Settings() {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch link token from backend
  const createLinkToken = async () => {
    if (Auth.loggedIn()) {
      const token = Auth.getToken();
      try {
        const data = await getMe(token);
        if (data.ok) {
          const res = await data.json();
          const response = await fetch("/api/plaid/create_link_token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ _id: res._id }),
          });

          const resData = await response.json();
          setLinkToken(resData.link_token);
        }
      } catch (error) {
        console.error("Error creating Plaid link token:", error);
      }
    }
  };

  // Initialize Plaid Link when the token is available
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      await fetch("/api/plaid/exchange_PublicToken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token }),
      });
    },
    onExit: () => {
      setLinkToken(null);
      setLoading(false);
    },
  });

  const handlePlaidLink = async () => {
    if (!linkToken) {
      setLoading(true);
      await createLinkToken();
    }
  };

  useEffect(() => {
    if (linkToken && ready) {
      open();
    }
  }, [linkToken, ready, open]);

  return (
    <div className="d-flex align-items-center justify-content-center mt-5">
      <div className="bg-light bg-gradient p-3 rounded border border-primary">
        <div>
          <h2 className="text-center">Settings</h2>
        </div>
        <ul className="list-unstyled list-group mt-3">
          <li
            className={`list-group-item list-group-item-action ${
              loading ? "disabled" : ""
            }`}
            style={{ cursor: "pointer" }}
            onClick={handlePlaidLink}
          >
            Link Bank Account
          </li>
        </ul>
      </div>
    </div>
  );
}
