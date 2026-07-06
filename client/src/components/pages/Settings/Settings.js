import { useState, useContext, useEffect, useRef } from "react";
import { userContext } from "../../../App";
import { updateUser } from "../../../utils/API/user";
import { removeAllAccounts } from "../../../utils/API/account";
import { PlaidPopUp } from "../../../utils/Plaid";
import auth from "../../../utils/auth";
import Modal from "../../Modal";
import AccountManagement from "./Modals/AccountManagement";

export default function Settings() {
  const { user, setUser, token } = useContext(userContext);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(null); // | "manageAccount" | null
  const [accounts, setAccounts] = useState(null);
  const [accountSelectionMenu, setAccountSelectionMenu] = useState(false);
  const accountManagementRef = useRef(null);

  const { openPlaidPopUp } = PlaidPopUp(user.id);

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

  const handleAccountManagementConfirm = async () => {
    const updatedUser = await accountManagementRef.current?.confirm();
    if (updatedUser) {
      setUser(updatedUser);
    }
    closeModal();
  };

  const modalConfig = {
    manageAccount: {
      title: "Account Management",
      body: <AccountManagement ref={accountManagementRef} />,
      confirmAction: handleAccountManagementConfirm,
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
