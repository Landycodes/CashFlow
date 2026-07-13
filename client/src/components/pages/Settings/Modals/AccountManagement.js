import {
  useState,
  useEffect,
  useContext,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  createAccount,
  getAllAccounts,
  deleteAccount,
} from "../../../../utils/API/account";
import { userContext } from "../../../../App";
import { updateUser } from "../../../../utils/API/user";
import Loading from "../../../Loading";

// ---- MAIN COMPONENT ----
export default forwardRef(function AccountManagement(_props, ref) {
  const { user, setUser, token } = useContext(userContext);
  const [loading, setLoading] = useState(true);
  const [debounceId, setDebounceId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [accountSelectionMenu, setAccountSelectionMenu] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(
    user.selected_account_id,
  );
  const [newAccount, setNewAccount] = useState({
    name: "",
    balance: "",
  });

  useImperativeHandle(ref, () => ({
    confirm: async () => {
      const updatedUser = await updateUser(token, {
        selected_account_id: selectedAccount,
      });
      return updatedUser;
    },
  }));

  const fetchAccounts = async (token) => {
    const foundAccounts = await getAllAccounts(token);
    if (!foundAccounts?.status) {
      setAccounts(foundAccounts);
      setLoading(false);
    } else {
      setAccounts([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts(token);
  }, [user]);

  const handleAddAccount = async (accountName, accountBalance) => {
    if (!accountName || !accountBalance) return;

    setLoading(true);
    setAccountSelectionMenu(false);

    const createdRes = await createAccount(token, {
      accountName,
      accountBalance,
    });
    if (!createdRes) return;

    setUser(createdRes);
    setSelectedAccount(createdRes.selected_account_id);
    setNewAccount({ name: "", balance: "" });
  };

  const handleDeleteAccount = async (id) => {
    setLoading(true);

    const deleteRes = await deleteAccount(token, { id });
    if (!deleteRes) return;
    setUser(deleteRes);
    setSelectedAccount(null);
  };

  return (
    <>
      <div className="mb-2 pb-3">
        {loading ? (
          <Loading />
        ) : (
          <AccountList
            accounts={accounts}
            selectedAccount={selectedAccount}
            onSelect={setSelectedAccount}
            onDelete={handleDeleteAccount}
          />
        )}
      </div>

      {accountSelectionMenu ? (
        <AddAccountForm
          newAccount={newAccount}
          setNewAccount={setNewAccount}
          onCancel={() => setAccountSelectionMenu(false)}
          onSave={handleAddAccount}
        />
      ) : (
        <button
          className="btn btn-outline-primary rounded border border-light mx-auto d-block"
          onClick={() => setAccountSelectionMenu(true)}
        >
          <span className="text-nowrap">Add An Account</span>
        </button>
      )}
    </>
  );
});

// ---- COMPONENT ACCOUNT LIST PARENT ----
const AccountList = ({ accounts, selectedAccount, onSelect, onDelete }) => {
  if (!accounts || accounts.length === 0) {
    return <p>No accounts available.</p>;
  }

  return (
    <>
      <label className="form-label">Accounts</label>
      {accounts.map((account) => {
        return (
          <AccountListItem
            key={account.id}
            account={account}
            isSelected={selectedAccount === account.id}
            onSelect={() => onSelect(account.id)}
            onDelete={() => onDelete(account.id)}
          />
        );
      })}
    </>
  );
};

// ---- COMPONENT ACCOUNT LIST CHILD ----
const AccountListItem = ({ account, isSelected, onSelect, onDelete }) => {
  return (
    <label
      className="form-control d-flex align-items-center btn rounded border-dark bg-dark text-light bg-gradient p-2 m-2"
      key={account.id}
    >
      <input
        type="radio"
        name="singleSelect"
        className="m-2"
        value={account.id}
        checked={isSelected}
        onChange={onSelect}
      />
      <div className="d-flex flex-row flex-grow-1">
        <span>{account.name}</span>
        <span className="ms-auto me-4">
          ${Number(account.available_balance).toLocaleString()}
        </span>
      </div>
      <button className="btn btn-light border-dark m-0 p-0" onClick={onDelete}>
        <img
          className="m-0 p-0"
          src="/trashcan.png"
          alt="Delete"
          height={30}
          width={30}
        />
      </button>
    </label>
  );
};

// ---- COMPONENT ADD ACCOUNT ----
const AddAccountForm = ({ newAccount, setNewAccount, onCancel, onSave }) => {
  return (
    <>
      <div className="mb-3">
        <div className="d-flex flex-row justify-content-between border-bottom m-2 my-3">
          <label className="form-label">Add Account</label>
          <button
            type="button"
            className="btn-close my-auto mb-2"
            onClick={onCancel}
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
        onClick={() => onSave(newAccount.name, newAccount.balance)}
      >
        Save
      </button>
    </>
  );
};
