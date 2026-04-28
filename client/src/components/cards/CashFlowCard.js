import { useState, useContext } from "react";
import PieChart from "../../utils/Piechart";
import { useEffect } from "react";
import { userContext } from "../../App";
import { getTransactionTotals } from "../../utils/API/transaction";
import { formatNum } from "../../utils/numberFormatter";

export default function CashflowCard({ range, setRange, rangeSelection }) {
  const { user, setUser, token } = useContext(userContext);

  const [transactions, setTransactions] = useState({
    income: 0,
    expense: 0,
    total: 0,
  });

  useEffect(() => {
    if (token && user?.plaidAccessToken && user?.selected_account_id) {
      getTransactionAmounts(token, range);
    }
  }, [user, range, token]);

  const getTransactionAmounts = async (token, days) => {
    let { income, expense } = await getTransactionTotals(token, days);
    income = income ?? 0;
    expense = expense ?? 0;

    setTransactions({
      income: income,
      expense: expense,
      total: income - expense,
    });
  };

  return (
    <div
      className="window-style d-flex flex-column align-items-center p-3 mx-3"
      style={{ minWidth: "535px", maxHeight: "100%" }}
    >
      <h3 className="style-text">CashFlow</h3>

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
        </div>
        <div className="d-flex flex-column justify-content-evenly align-items-start">
          <div className="d-flex">
            <div className="bg-dark rounded p-3 m-1">
              <p className="style-subtext small mb-1">Deposited</p>
              <h4 className="text-success ms-2">
                ${formatNum(transactions.income)}
              </h4>
            </div>
            <div className="bg-dark rounded p-3 m-1">
              <p className="style-subtext small mb-1">Withdrawn</p>
              <h4 className="text-danger ms-2">
                ${formatNum(transactions.expense)}
              </h4>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center w-100">
            <div className="d-flex flex-column align-items-center bg-dark p-3 rounded w-50">
              <p className="style-subtext small mb-1">CashFlow</p>
              <h4
                className={
                  transactions.total < 0 ? "text-danger" : "text-success"
                }
              >
                {transactions.total < 0 ? "-" : ""}$
                {formatNum(Math.abs(transactions.total).toFixed(2))}
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
