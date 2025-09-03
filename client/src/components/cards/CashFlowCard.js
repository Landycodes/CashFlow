import { useState, useContext } from "react";
import PieChart from "../../utils/Piechart";
import { useEffect } from "react";
import { userContext } from "../../App";
import { getTransactionTotals } from "../../utils/API";

export default function CashflowCard() {
  const { user, setUser } = useContext(userContext);
  const ONE_YEAR = 365;
  const SIX_MONTH = 182;
  const THREE_MONTH = 91;
  const ONE_MONTH = 30;
  const TWO_WEEKS = 14;
  const ONE_WEEK = 7;

  const [range, setRange] = useState(ONE_YEAR);
  const [transactions, setTransactions] = useState({
    income: 0,
    expense: 0,
    total: 0,
  });

  useEffect(() => {
    if (user?.plaidAccessToken && user?.selectedAccount) {
      getTransactionAmounts(range);
    }
  }, [user, range]);

  const getTransactionAmounts = async (days) => {
    const { income, expense } = await getTransactionTotals(
      user._id,
      user.selected_account_id,
      days
    );

    setTransactions({
      income: income,
      expense: expense,
      total: income - expense,
    });
  };

  return (
    <div
      className="d-flex flex-column align-items-center bg-light bg-gradient p-3 mx-5 rounded border border-primary"
      style={{ width: "325px" }}
    >
      <h3>CashFlow</h3>
      <div
        style={{ width: "225px", height: "225px" }}
        className="d-flex justify-content-center align-items-center mt-2 mb-3"
      >
        <PieChart
          data={{
            labels: ["Earned", "Spent"],
            values: [transactions.income, transactions.expense],
          }}
        />
      </div>

      <select
        className="form-select text-center border-primary py-1"
        id="floatingSelect"
        value={range}
        onChange={(event) => setRange(event.target.value)}
        style={{ fontSize: "1.25rem", fontWeight: "500" }} // mimic h3
      >
        <option value={ONE_YEAR}>1 Year</option>
        <option value={SIX_MONTH}>6 Months</option>
        <option value={THREE_MONTH}>3 Months</option>
        <option value={ONE_MONTH}>1 Month</option>
        <option value={TWO_WEEKS}>2 Weeks</option>
        <option value={ONE_WEEK}>1 Week</option>
      </select>

      <hr style={{ height: "5px", backgroundColor: "black" }}></hr>

      <h3>
        Deposited: <span className="text-success">${transactions.income}</span>
      </h3>
      <hr style={{ height: "3px", backgroundColor: "black" }}></hr>

      <h3>
        Withdrawn: <span className="text-danger">${transactions.expense}</span>
      </h3>
      <hr style={{ height: "3px", backgroundColor: "black" }}></hr>
      <h3 className="text-center">
        CashFlow:&nbsp;
        <span
          className={transactions.total < 0 ? "text-danger" : "text-success"}
        >
          {transactions.total < 0 ? "-" : ""}$
          {Math.abs(transactions.total).toFixed(2)}
        </span>
      </h3>
    </div>
  );
}
