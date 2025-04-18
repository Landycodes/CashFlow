import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import Auth from "../../utils/auth";
import {
  createPlaidLinkToken,
  exchangeAndSavePlaidToken,
  getMe,
} from "../../utils/API";

export default function Settings() {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user_id, setUser_id] = useState("");

  // Fetch link token from backend
  const createLinkToken = async () => {
    if (Auth.loggedIn()) {
      const token = Auth.getToken();
      try {
        const data = await getMe(token);
        if (data.ok) {
          const user = await data.json();
          const response = await createPlaidLinkToken(user._id);
          setUser_id(user._id);
          setLinkToken(response.link_token);
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
      await exchangeAndSavePlaidToken(public_token, user_id);
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
    if (linkToken && ready && user_id) {
      open();
    }
  }, [linkToken, ready, open, user_id]);

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
