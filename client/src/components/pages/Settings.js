import { useEffect, useState, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../App";
import { updateUser } from "../../utils/API";
import { PlaidPopUp } from "../../utils/Plaid";
export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [accountPopUp, setAccountPopup] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(
    parseInt(localStorage.getItem("current_Account"))
  );

  const { user, setUser } = useContext(userContext);
  const { openPlaidPopUp } = PlaidPopUp(user._id);
  const accounts = user?.accounts;

  const handlePlaidLink = () => {
    try {
      setLoading(true);
      openPlaidPopUp();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlaidLink = async () => {
    try {
      const removedTokenUser = await updateUser(user._id, {
        plaidAccessToken: "",
        accounts: [],
      });
      setUser(removedTokenUser);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAccountSelect = async (selectedAccount) => {
    localStorage.setItem("current_Account", selectedAccount);
    setAccountPopup(false);
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-center mt-5">
        <div className="bg-light bg-gradient p-3 rounded border border-primary">
          <div>
            <h2 className="text-center">Settings</h2>
          </div>
          {user?.plaidAccessToken ? (
            <ul className="list-unstyled list-group mt-3">
              <li
                className={`list-group-item list-group-item-action btn border mb-2 ${
                  loading ? "disabled" : ""
                }`}
                onClick={handleRemovePlaidLink}
              >
                UnLink Bank Account
              </li>
              <li
                className="list-group-item list-group-item-action btn border mb-2"
                onClick={() => setAccountPopup(true)}
              >
                Choose Account
              </li>
            </ul>
          ) : (
            <ul className="list-unstyled list-group mt-3">
              <li
                className={`list-group-item list-group-item-action btn border ${
                  loading ? "disabled" : ""
                }`}
                onClick={handlePlaidLink}
              >
                Link Bank Account
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* account select Modal */}
      {accountPopUp && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog mt-5" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Account Selection</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setAccountPopup(false)}
                ></button>
              </div>
              <div className="modal-body">
                {accounts && accounts.length > 0 ? (
                  accounts.map((account, index) => (
                    <label
                      key={index}
                      style={{ display: "block", margin: "5px 0" }}
                    >
                      <input
                        type="radio"
                        name="singleSelect"
                        className="m-2"
                        value={index}
                        checked={selectedAccount === index}
                        onChange={() => setSelectedAccount(index)}
                      />
                      {account.name}: Balance: ${account.available_balance}
                    </label>
                  ))
                ) : (
                  <p>Currently no accounts to choose from...</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAccountPopup(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAccountSelect(selectedAccount)}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
