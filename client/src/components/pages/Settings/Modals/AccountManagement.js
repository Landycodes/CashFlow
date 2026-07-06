import {
  useState,
  useEffect,
  useContext,
  forwardRef,
  useImperativeHandle,
} from "react";
import { userContext } from "../../../../App";
import { updateUser } from "../../../../utils/API/user";
import {
  createAccount,
  getAccounts,
  deleteAccount,
} from "../../../../utils/API/account";

export default forwardRef(function AccountManagement(_props, ref) {
  const { user, setUser, token } = useContext(userContext);
  const [accounts, setAccounts] = useState([]);
  const [accountSelectionMenu, setAccountSelectionMenu] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(
    user.selected_account_id,
  );
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: "",
  });

  const fetchAccounts = async (token) => {
    const foundAccounts = await getAccounts(token);
    setAccounts(foundAccounts);
  };

  useEffect(() => {
    if (!selectedAccount) return;
    fetchAccounts(token);
  }, [user]);

  const handleAddAccount = async (accountName, accountBalance) => {
    await createAccount(token, { accountName, accountBalance });
    fetchAccounts(token);
    setAccountSelectionMenu(false);
  };

  const handleDeleteAccount = async (id) => {
    await deleteAccount(token, { id });
    fetchAccounts(token);
  };

  return (
    <>
      <div className="mb-2 pb-3">
        <label className="form-label">Accounts</label>
        {accounts && accounts.length > 0 ? (
          accounts.map((account) => (
            <label
              className="form-control d-flex align-items-center btn rounded border-dark bg-dark text-light bg-gradient p-2 m-2"
              key={account.id}
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
              <button
                className="btn btn-light border-dark m-0 p-0"
                onClick={() => handleDeleteAccount(account.id)}
              >
                <img
                  className="m-0 p-0"
                  src="/trashcan.png"
                  alt="Delete"
                  height={30}
                  width={30}
                />
              </button>
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
          <button
            className="btn btn-success float-end my-auto"
            onClick={() =>
              handleAddAccount(newAccount.name, newAccount.balance)
            }
          >
            Save
          </button>
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
});
