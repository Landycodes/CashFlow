import { useContext } from "react";
import { userContext } from "../../App";
import { useState } from "react";
import { useEffect } from "react";
import {
  updateUser,
  getSingleAccount,
  getNextRecurring,
} from "../../utils/API";
import formatDate from "../../utils/dateFormatter";

export default function CurrentAccountInfo() {
  // TODO: CHANGE BACK AFTER TESTING
  const now = Date.parse("2026-01-01T00:00:00.000Z"); /* Date.now(); */
  const { user, setUser, token } = useContext(userContext);
  const [accountDetails, setAccountDetails] = useState({
    name: null,
    balance: 0,
    next_pay: null,
    due_before_payday: null,
    id: null,
  });

  useEffect(() => {
    if (!user?.selected_account_id) return;
    setAccount(token);
    // TODO: THROW THIS LOGIC IN THE BACKEND
    // if (
    //   user?.bills.filter((b) => b.charged_to === user.selected_account_id)
    //     .length > 0
    // ) {
    //   const nextPayCheck = user.income
    //     .filter((i) => i.deposited_to === user.selected_account_id)
    //     .reduce((acc, cv) => {
    //       if (!acc) return cv;

    //       const closetDate = Math.abs(Date.parse(acc.predicted_next_pay) - now);
    //       const currentDate = Math.abs(Date.parse(cv.predicted_next_pay) - now);

    //       return currentDate < closetDate ? cv : acc;
    //     }, null);

    //   const dueBefore_Payday = user.bills
    //     .filter(
    //       (b) =>
    //         b.charged_to === user.selected_account_id &&
    //         Date.parse(b.next_due) <
    //           Date.parse(nextPayCheck.predicted_next_pay),
    //     )
    //     .reduce((sum, b) => sum + b.amount, 0);

    //   setAccountDetails({
    //     name: user.selectedAccount.name,
    //     balance: user.selectedAccount.available_balance,
    //     next_pay: formatDate(nextPayCheck.predicted_next_pay),
    //     due_before_payday: dueBefore_Payday,
    //     id: user.selectedAccount.account_id,
    //   });
    // } else {
    //   setAccountDetails({
    //     name: user.selectedAccount.name,
    //     balance: user.selectedAccount.available_balance,
    //     id: user.selectedAccount.account_id,
    //   });
    // }
  }, [user]);

  const setAccount = async (token) => {
    const account = await getSingleAccount(token);
    const upcoming = await getNextRecurring(token);

    setAccountDetails({
      name: account.name,
      balance: account.available_balance,
      next_pay: upcoming?.nextPayment,
      due_before_payday: upcoming?.nextBillsDue,
      id: account.account_id,
    });
  };

  return (
    <div
      className="d-flex flex-column align-items-center bg-gradient p-2 rounded border border-secondary"
      style={{ minWidth: "500px" }}
    >
      <h3 className="text-light text-opacity-75">Account</h3>
      <div className="d-flex flex-column align-items-start">
        <span className="info-text fs-5">
          <div className="bg-dark rounded p-3 m-2">
            <h5>Current Balance</h5>
            <h3 className="ms-3">${accountDetails.balance}</h3>
          </div>
          {!accountDetails.next_pay || !accountDetails.due_before_payday ? (
            ""
          ) : (
            <>
              <div className="d-flex m-2">
                <div className="bg-dark rounded p-3 m-2">
                  <h6>Next Paycheck</h6>
                  <h5>{accountDetails.next_pay}</h5>
                </div>
                <div className="bg-dark rounded p-3 m-2">
                  <h6>Due Before Payday</h6>
                  <h5 className="text-danger ms-3">
                    ${accountDetails.due_before_payday}
                  </h5>
                </div>
              </div>
              <div className="bg-dark rounded p-3 m-2">
                <h5>Leftover</h5>
                <h3 className="text-success ms-3">
                  $
                  {(
                    accountDetails.balance - accountDetails.due_before_payday
                  ).toFixed(2)}
                </h3>
              </div>
            </>
          )}
        </span>
      </div>
    </div>
  );
}
