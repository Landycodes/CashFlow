import React, { useEffect, useState, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";
import Auth from "../../utils/auth";
import {
  createPlaidLinkToken,
  exchangeAndSavePlaidToken,
} from "../../utils/API";
import { userContext } from "../Content";

export default function Settings(/* { user } */) {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const user = useContext(userContext);
  // const [user_id, setUser_id] = useState("");

  // Fetch link token from backend
  const createLinkToken = async () => {
    try {
      const response = await createPlaidLinkToken(user._id);
      // setUser_id(user._id);
      setLinkToken(response.link_token);
    } catch (error) {
      console.error("Error creating Plaid link token:", error);
    }
  };

  // Initialize Plaid Link when the token is available
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token) => {
      await exchangeAndSavePlaidToken(public_token, user._id);
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
    if (linkToken && ready && user) {
      open();
    }
  }, [linkToken, ready, open, user]);

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
