import { useState, useContext } from "react";
import PieChart from "../../utils/Piechart";
import { useEffect } from "react";
import { userContext } from "../../App";
import { getTransactionTotals } from "../../utils/API";
import Transactions from "../pages/Transactions";

export default function CashflowCard({ range, setRange, rangeSelection }) {
  const { user, setUser, token } = useContext(userContext);

  const [transactions, setTransactions] = useState({
    income: 0,
    expense: 0,
    total: 0,
  });

  useEffect(() => {
    if (token && user?.plaidAccessToken && user?.selectedAccount) {
      getTransactionAmounts(token, range);
    }
  }, [user, range, token]);

  const getTransactionAmounts = async (token, days) => {
    const { income, expense } = await getTransactionTotals(token, days);

    setTransactions({
      income: income,
      expense: expense,
      total: income - expense,
    });
  };

  return (
    <div
      className="d-flex flex-column align-items-center bg-gradient p-3 mx-5 rounded border border-secondary"
      style={{ minWidth: "535px", maxHeight: "100%" }}
    >
      <h3 className="text-muted text-opacity-50">CashFlow</h3>

      <div className="d-flex flex-row justify-content-between align-items-between w-100">
        <div>
          {transactions.income > 0 && transactions.expense > 0 ? (
            <>
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
            </>
          ) : (
            ""
          )}

          <select
            className="form-select text-center border-primary py-1"
            id="floatingSelect"
            value={range}
            onChange={(event) => setRange(event.target.value)}
            style={{ fontSize: "1.25rem", fontWeight: "500" }} // mimic h3
          >
            <option value={rangeSelection.ONE_YEAR}>1 Year</option>
            <option value={rangeSelection.SIX_MONTH}>6 Months</option>
            <option value={rangeSelection.THREE_MONTH}>3 Months</option>
            <option value={rangeSelection.ONE_MONTH}>1 Month</option>
            <option value={rangeSelection.TWO_WEEKS}>2 Weeks</option>
            <option value={rangeSelection.ONE_WEEK}>1 Week</option>
          </select>
        </div>
        <div className="info-text d-flex flex-column justify-content-evenly align-items-start">
          <h5>
            Deposited:{" "}
            <span className="text-success">${transactions.income}</span>
          </h5>

          <h5>
            Withdrawn:{" "}
            <span className="text-danger">${transactions.expense}</span>
          </h5>
          <h5 className="text-center">
            CashFlow:&nbsp;
            <span
              className={
                transactions.total < 0 ? "text-danger" : "text-success"
              }
            >
              {transactions.total < 0 ? "-" : ""}$
              {Math.abs(transactions.total).toFixed(2)}
            </span>
          </h5>
        </div>
      </div>
    </div>
  );
}
