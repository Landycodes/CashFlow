import { useEffect, useState, useContext } from "react";
import { usePlaidLink } from "react-plaid-link";
import { useNavigate } from "react-router-dom";
import { userContext } from "../../App";
import { deleteUserTransactions, updateUser } from "../../utils/API";
import { PlaidPopUp } from "../../utils/Plaid";
export default function Settings({ token }) {
  const { user, setUser } = useContext(userContext);
  const [loading, setLoading] = useState(false);
  const [selectMenu, setselectMenu] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(
    user.selected_account_id
  );

  const { openPlaidPopUp } = PlaidPopUp(user._id);
  const accounts = user?.accounts;

  const handlePlaidLink = () => {
    try {
      setLoading(true);
      openPlaidPopUp(token);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlaidLink = async () => {
    try {
      const [updatedAccount, updatedTransactions] = await Promise.all([
        updateUser(user._id, {
          last_updated: "",
          selected_account_id: "",
          plaidAccessToken: "",
          accounts: [],
        }),
        deleteUserTransactions(user._id),
      ]);

      if (updatedAccount && updatedTransactions) {
        setUser(updatedAccount);
      }
    } catch (error) {
      console.log("Failed to unlink plaid account: ", error);
    }
  };

  const handleAccountSelect = async (selectedAccount) => {
    const updatedUser = await updateUser(user._id, {
      selected_account_id: selectedAccount,
    });
    setUser(updatedUser);
    setselectMenu(false);
  };

  const SelectAccountMenu = () => {
    return (
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
                onClick={() => setselectMenu(false)}
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
                      value={account.account_id}
                      checked={selectedAccount === account.account_id}
                      onChange={() => setSelectedAccount(account.account_id)}
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
                onClick={() => setselectMenu(false)}
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
    );
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
                onClick={() => setselectMenu(true)}
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

      {selectMenu && <SelectAccountMenu />}
    </>
  );
}
