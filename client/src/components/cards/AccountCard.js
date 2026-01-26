import { useContext } from "react";
import { userContext } from "../../App";
import { useState } from "react";
import { useEffect } from "react";
import { updateUser } from "../../utils/API";

export default function CurrentAccountInfo() {
  const { user, setUser } = useContext(userContext);
  const [accountDetails, setAccountDetails] = useState({
    name: null,
    balance: 0,
    next_pay: null,
    id: null,
  });

  const convertNextPayDate = (incObj) => {
    function getSuffixFor(day) {
      if (day % 10 === 1 && day !== 11) return "st";
      if (day % 10 === 2 && day !== 12) return "nd";
      if (day % 10 === 3 && day !== 13) return "rd";
      return "th";
    }
    function formatDate(dateString) {
      const date = new Date(dateString);
      const day = date.getUTCDate();
      const month = date.toLocaleString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      return `${month} ${day}${getSuffixFor(day)}`;
    }

    if (incObj.length > 1) {
      const dates = [];
      incObj.forEach((io) => {
        const formattedDate = formatDate(io.predicted_next_pay);
        dates.push(`${io.description}: ${formattedDate}`);
      });
      return dates.join(" / ");
    }

    return formatDate(incObj[0].predicted_next_pay);
  };

  useEffect(() => {
    if (user?.selectedAccount) {
      setAccountDetails({
        name: user.selectedAccount.name,
        balance: user.selectedAccount.available_balance,
        next_pay: convertNextPayDate(user.income),
        id: user.selectedAccount.account_id,
      });
    }
  }, [user]);

  const handleAccountSelect = async (event) => {
    const updatedUser = await updateUser(user._id, {
      selected_account_id: event.target.value,
    });
    setUser(updatedUser);
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
                <option key={acct.account_id} value={acct.account_id}>
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
      <h2>Next Paycheck: {accountDetails.next_pay}</h2>
    </div>
  );
}
