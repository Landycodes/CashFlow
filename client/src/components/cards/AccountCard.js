import { useContext } from "react";
import { userContext } from "../../App";
import { useState } from "react";
import { useEffect } from "react";
import { updateUser } from "../../utils/API";
import formatDate from "../../utils/dateFormatter";

export default function CurrentAccountInfo() {
  const now = Date.parse("2026-01-01T00:00:00.000Z"); /* Date.now(); */
  const { user, setUser } = useContext(userContext);
  const [accountDetails, setAccountDetails] = useState({
    name: null,
    balance: 0,
    next_pay: null,
    due_before_payday: null,
    id: null,
  });

  useEffect(() => {
    if (!user?.selectedAccount) return;

    if (
      user?.bills.filter((b) => b.charged_to === user.selected_account_id)
        .length > 0
    ) {
      const nextPayCheck = user.income
        .filter((i) => i.deposited_to === user.selected_account_id)
        .reduce((acc, cv) => {
          if (!acc) return cv;

          const closetDate = Math.abs(Date.parse(acc.predicted_next_pay) - now);
          const currentDate = Math.abs(Date.parse(cv.predicted_next_pay) - now);

          return currentDate < closetDate ? cv : acc;
        }, null);

      const dueBefore_Payday = user.bills
        .filter(
          (b) =>
            b.charged_to === user.selected_account_id &&
            Date.parse(b.next_due) < Date.parse(nextPayCheck.predicted_next_pay)
        )
        .reduce((sum, b) => sum + b.amount, 0);

      setAccountDetails({
        name: user.selectedAccount.name,
        balance: user.selectedAccount.available_balance,
        next_pay: formatDate(nextPayCheck.predicted_next_pay),
        due_before_payday: dueBefore_Payday,
        id: user.selectedAccount.account_id,
      });
    } else {
      setAccountDetails({
        name: user.selectedAccount.name,
        balance: user.selectedAccount.available_balance,
        id: user.selectedAccount.account_id,
      });
    }
  }, [user]);

  return (
    <div
      className="d-flex flex-column align-items-start bg-gradient p-3 my-4 rounded border border-secondary"
      style={{ minWidth: "350px" }}
    >
      <h3 className="text-muted text-opacity-50">Account Overview</h3>
      <h2>Current Balance: ${accountDetails.balance}</h2>
      {!accountDetails.next_pay || !accountDetails.due_before_payday ? (
        ""
      ) : (
        <>
          <h2>Next Paycheck: {accountDetails.next_pay}</h2>
          <h2>
            Amount Due Before Paycheck:{" "}
            <span className="text-danger text-nowrap">
              ${accountDetails.due_before_payday}
            </span>
          </h2>
          <h2>
            Leftover:{" "}
            <span className="text-success text-nowrap">
              ${accountDetails.balance - accountDetails.due_before_payday}
            </span>
          </h2>
        </>
      )}
    </div>
  );
}
