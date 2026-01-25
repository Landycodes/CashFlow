import { useContext } from "react";
import { userContext } from "../../App";
import { useState } from "react";
import { useEffect } from "react";
import { updateUser } from "../../utils/API";

export default function CurrentAccountInfo() {
  const { user } = useContext(userContext);
  const [accountDetails, setAccountDetails] = useState({
    name: null,
    balance: 0,
  });

  useEffect(() => {
    if (user?.selectedAccount) {
      console.log(user);
      setAccountDetails({
        name: user.selectedAccount.name,
        balance: user.selectedAccount.available_balance,
        id: user.selectedAccount.account_id,
      });
    }
  }, [user]);

  const handleAccountSelect = async (selectedAccount) => {
    const updatedUser = await updateUser(user._id, {
      selected_account_id: selectedAccount,
    });
    console.log(updatedUser);
  };

  return (
    <div
      className="d-flex flex-column align-items-start bg-light bg-gradient p-3 my-4 rounded border border-primary"
      style={{ minWidth: "350px" }}
    >
      <div className="form-floating w-100">
        <select
          value={user.selected_account_id}
          onChange={handleAccountSelect}
          className="form-select"
        >
          {user?.accounts ? (
            user.accounts.map((acct) => {
              return (
                <option
                  defaultValue={accountDetails?.id === acct.account_id}
                  key={acct._id}
                  value={acct.account_id}
                >
                  {acct.name}
                </option>
              );
            })
          ) : (
            <option selected>No Account To Select From</option>
          )}
        </select>
      </div>
      <h2>
        Current Balance:{" "}
        <span className="text-success text-nowrap">
          ${accountDetails.balance}
        </span>
      </h2>
      <h2>Next Paycheck: </h2>
    </div>
  );
}
