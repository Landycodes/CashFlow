import { useEffect, useState, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../App";
import {
  createPlaidLinkToken,
  exchangeAndSavePlaidToken,
  updateUser,
} from "../../utils/API";

export default function Settings() {
  const [linkToken, setLinkToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(userContext);
  const navigate = useNavigate();

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
      navigate("/");
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
          {user?.plaidAccessToken ? (
            <li
              className={`list-group-item list-group-item-action btn border ${
                loading ? "disabled" : ""
              }`}
              onClick={async () => {
                const removedTokenUser = await updateUser(
                  user._id,
                  "plaidAccessToken",
                  ""
                );
                setUser(removedTokenUser);
              }}
            >
              UnLink Bank Account
            </li>
          ) : (
            <li
              className={`list-group-item list-group-item-action btn border ${
                loading ? "disabled" : ""
              }`}
              onClick={handlePlaidLink}
            >
              Link Bank Account
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
