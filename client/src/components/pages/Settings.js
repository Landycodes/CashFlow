import { useState, useContext, useEffect } from "react";
import { userContext } from "../../App";
import { updateUser } from "../../utils/API/user";
import {
  createAccount,
  getAccounts,
  removeAllAccounts,
} from "../../utils/API/account";
import { PlaidPopUp } from "../../utils/Plaid";
import auth from "../../utils/auth";
import Modal from "../Modal";

export default function Settings() {
  const { user, setUser, token } = useContext(userContext);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // | "manageAccount" | null
  const [accounts, setAccounts] = useState(null);
  const [accountSelectionMenu, setAccountSelectionMenu] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(
    user.selected_account_id,
  );
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: "",
  });

  const { openPlaidPopUp } = PlaidPopUp(user.id);
  // const accounts = user?.accounts;

  useEffect(() => {
    if (!selectedAccount) return;
    getAccounts(token).then((data) => setAccounts(data));
  }, [user]);

  const closeModal = () => setModalType(null);

  const handlePlaidLink = () => {
    try {
      setLoading(true);
      const token = auth.getToken();
      openPlaidPopUp(token);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePlaidLink = async () => {
    try {
      const updatedAccount = await removeAllAccounts(token);
      if (updatedAccount) {
        setUser(updatedAccount);
        window.location.reload();
      }
    } catch (error) {
      console.log("Failed to unlink plaid account: ", error);
    }
  };

  const handleAccountSelect = async () => {
    const updatedUser = await updateUser(user.id, {
      selected_account_id: selectedAccount,
    });
    setUser(updatedUser);
    closeModal();
  };

  const handleAddAccount = async () => {
    // wire up your create account API call here
    const createdAccount = await createAccount(token, newAccount);
    console.log("creating account:", createdAccount);
    closeModal();
  };

  const manageAccountBody = (
    <>
      <div className="mb-2 pb-3">
        <label className="form-label">Accounts</label>
        {accounts && accounts.length > 0 ? (
          accounts.map((account) => (
            <label
              key={account.id}
              className="form-control d-flex align-items-center btn rounded border-dark bg-dark text-light bg-gradient p-2 m-2"
            >
              <input
                type="radio"
                name="singleSelect"
                className="m-2"
                value={account.id}
                checked={selectedAccount === account.id}
                onChange={() => setSelectedAccount(account.id)}
              />
              <div className="d-flex flex-row flex-grow-1">
                <span>{account.name}</span>
                <span className="ms-auto me-4">
                  ${account.available_balance}
                </span>
              </div>
            </label>
          ))
        ) : (
          <p>No accounts available.</p>
        )}
      </div>
      {accountSelectionMenu ? (
        <>
          <div className="mb-3">
            <div className="d-flex flex-row justify-content-between border-bottom m-2 my-3">
              <label className="form-label">Add Account</label>
              <button
                type="button"
                className="btn-close my-auto"
                onClick={() => setAccountSelectionMenu(false)}
              ></button>
            </div>

            <label className="form-label">Account Name</label>
            <input
              type="text"
              className="form-control rounded border-dark bg-dark text-light bg-gradient p-2"
              value={newAccount.name}
              onChange={(e) =>
                setNewAccount({ ...newAccount, name: e.target.value })
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Current Balance</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control rounded border-dark bg-dark text-light bg-gradient p-2"
              value={newAccount.balance}
              onChange={(e) =>
                setNewAccount({ ...newAccount, balance: e.target.value })
              }
            />
          </div>
        </>
      ) : (
        <div
          className="btn btn-sm btn-outline-primary rounded border border-light mx-auto d-block w-25"
          onClick={() => setAccountSelectionMenu(true)}
        >
          <span className="fs-3">+</span>
        </div>
      )}
    </>
  );

  const modalConfig = {
    manageAccount: {
      title: "Account Management",
      body: manageAccountBody,
      confirmAction: handleAddAccount,
    },
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-center mt-5">
        <div className="bg-gradient p-3 rounded border border-secondary">
          <div>
            <h2 className="text-center style-text opacity-100">Settings</h2>
          </div>
          {user?.plaidAccessToken ? (
            <ul className="list-unstyled list-group mt-3">
              <li
                className={`list-group-item list-group-item-action btn border mb-2 ${loading ? "disabled" : ""}`}
                onClick={handleRemovePlaidLink}
              >
                UnLink Bank Account
              </li>
              <li
                className="list-group-item list-group-item-action btn border mb-2"
                onClick={() => setModalType("selectAccount")}
              >
                Choose Account
              </li>
            </ul>
          ) : (
            <ul className="list-unstyled list-group mt-3">
              <li
                className={`window-style-dark style-text opacity-100 fs-4 btn border ${loading ? "disabled" : ""}`}
                onClick={handlePlaidLink}
              >
                Link With Plaid
              </li>
              <li
                className="window-style-dark style-text opacity-100 fs-4 btn border"
                onClick={() => setModalType("manageAccount")}
              >
                Manage Accounts
              </li>
            </ul>
          )}
        </div>
      </div>

      {modalType && (
        <Modal
          title={modalConfig[modalType].title}
          body={modalConfig[modalType].body}
          confirmAction={modalConfig[modalType].confirmAction}
          onClose={closeModal}
        />
      )}
    </>
  );
}
