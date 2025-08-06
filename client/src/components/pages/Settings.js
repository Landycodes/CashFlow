import { useEffect, useState, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../App";
import {
  createPlaidLinkToken,
  exchangeAndSavePlaidToken,
  updateUser,
} from "../../utils/API";
import { PlaidPopUp } from "../../utils/Plaid";
export default function Settings() {
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(userContext);
  const { openPlaidPopUp } = PlaidPopUp(user._id);
  const navigate = useNavigate();

  const handlePlaidLink = () => {
    try {
      setLoading(true);
      openPlaidPopUp();
      navigate("/");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlaidLink = async () => {
    try {
      const removedTokenUser = await updateUser(
        user._id,
        "plaidAccessToken",
        ""
      );
      setUser(removedTokenUser);
    } catch (error) {
      console.log(error);
    }
  };

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
              onClick={handleRemovePlaidLink}
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
