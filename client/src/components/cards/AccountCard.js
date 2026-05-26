import { useContext } from "react";
import { userContext } from "../../App";
import { useState } from "react";
import { useEffect } from "react";
import { getNextRecurring } from "../../utils/API/recurring";
import { getSingleAccount } from "../../utils/API/account";
import { formatCurrency } from "../../utils/numberFormatter";

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
  }, [user]);

  const setAccount = async (token) => {
    const account = await getSingleAccount(token);
    const upcoming = await getNextRecurring(token);

    setAccountDetails({
      name: account.name,
      balance: account.available_balance,
      next_pay_amount: upcoming?.nextPayment?.amount,
      next_pay_date: upcoming?.nextPayment?.date,
      due_before_payday: upcoming?.nextBillsDue?.total,
      id: account.account_id,
    });
  };

  return (
    <div className="window-style" style={{ minWidth: "500px" }}>
      <h3 className="style-text text-center">Account</h3>
      <div className="row g-2 mb-2">
        <div className="col">
          <div className="window-style-dark rounded p-3">
            <p className="style-subtext small mb-1">Current balance</p>
            <p className="fs-4 fw-medium mb-0">
              {formatCurrency(accountDetails.balance)}
            </p>
          </div>
        </div>
        <div className="col">
          <div className="window-style-dark rounded p-3">
            <p className="style-subtext small mb-1 text-nowrap">
              Next paycheck on{" "}
              <span className="text-end mb-0">
                {accountDetails.next_pay_date}
              </span>
            </p>
            <p className="fs-4 fw-medium opacity-75 mb-0">
              {formatCurrency(accountDetails.next_pay_amount) || "No Data"}
            </p>
          </div>
        </div>
      </div>
      <hr className="border-secondary opacity-25 my-2" />
      <div className="row g-2">
        <div className="col">
          <div className="window-style-dark rounded p-3">
            <p className="style-subtext small mb-1">
              Due before {accountDetails.next_pay_date}
            </p>
            <p className="fs-4 fw-medium mb-0 text-danger">
              {formatCurrency(accountDetails.due_before_payday) || "No Data"}
            </p>
          </div>
        </div>
        <div className="col">
          <div className="window-style-dark rounded p-3">
            <p className="style-subtext small mb-1">Leftover</p>
            <p className="fs-4 fw-medium mb-0 text-success">
              {formatCurrency(
                (
                  accountDetails.balance - accountDetails.due_before_payday
                ).toFixed(2),
              ) || "No Data"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
