import React, { useEffect, useState, useContext } from "react";
// import Auth from "../../utils/auth";
import { getAccountBalance, getTransactionHistory } from "../../utils/API";
import { userContext } from "../../App";
import PieChart from "../Piechart";
import Loading from "../Loading";

export default function Dashboard() {
  const { user, setUser } = useContext(userContext);
  // const user = userObject.user;

  const [range, setRange] = useState("total");
  const [bankDetails, setBankDetails] = useState({
    balance: null,
    income: null,
    expense: null,
  });

  const haveBankDetails = Object.values(bankDetails).every((v) => v !== null);
  const isNegativeBalance = bankDetails.expense > bankDetails.income;

  useEffect(() => {
    getBalance();
    getTransactions();
  }, []);

  const getBalance = () => {
    if (user?.plaidAccessToken) {
      getAccountBalance(user.plaidAccessToken).then((data) => {
        if (!data.error) {
          setBankDetails((bd) => ({
            ...bd,
            balance: data[0].balances.available,
          }));
        }
      });
    }
  };

  const getTransactions = () => {
    if (user?.plaidAccessToken) {
      getTransactionHistory(user.plaidAccessToken).then((data) => {
        console.log(data);
        if (!data.error) {
          setBankDetails((bd) => ({
            ...bd,
            income: parseFloat(
              data
                .filter((t) => t.amount < 0)
                .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                .toFixed(2)
            ),
            expense: parseFloat(
              data
                .filter((t) => t.amount > 0)
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)
            ),
          }));
        }
      });
    }
  };

  const handleChange = (event) => {
    setRange(event.target.value);
  };

  return (
    <div className="d-flex align-items-center justify-content-center mt-5">
      {user?.plaidAccessToken ? (
        haveBankDetails ? (
          <div className="d-flex flex-column align-items-center bg-light bg-gradient p-3 rounded border border-primary">
            <h1>
              Current Balance:{" "}
              <span className="text-success">${bankDetails.balance}</span>
            </h1>
            <div
              style={{ width: "225px", height: "225px" }}
              className="mt-2 mb-3"
            >
              <PieChart
                data={{
                  labels: ["Earned", "Spent"],
                  values: [bankDetails.income, bankDetails.expense],
                }}
              />
            </div>

            <select
              className="w-100 mt-0 mb-2 btn btn-sm border border-2 border-primary rounded"
              onChange={handleChange}
            >
              <option value={"total"}>Total</option>
              <option value={"oneWeek"}>1 week</option>
              <option value={"twoWeek"}>2 week</option>
              <option value={"oneMonth"}>1 month</option>
              <option value={"threeMonth"}>3 months</option>
              <option value={"sixMonth"}>6 months</option>
              <option value={"oneYear"}>1 year</option>
            </select>

            <hr style={{ height: "5px", backgroundColor: "black" }}></hr>

            <h1>
              Earned:{" "}
              <span className="text-success">${bankDetails.income}</span>
            </h1>
            <h4 className="text-center">-</h4>
            <h1>
              Expenses:{" "}
              <span className="text-danger">${bankDetails.expense}</span>
            </h1>
            <hr style={{ height: "5px", backgroundColor: "black" }}></hr>
            <h1 className="text-center">
              Total:&nbsp;
              <span
                className={isNegativeBalance ? "text-danger" : "text-success"}
              >
                {isNegativeBalance ? "-" : ""}$
                {Math.abs(bankDetails.income - bankDetails.expense)}
              </span>
            </h1>
          </div>
        ) : (
          <Loading message={"Getting Bank Details"} />
        )
      ) : (
        <div className="bg-light bg-gradient p-3 rounded border border-primary">
          <h4 className="text-center">
            <b>Welcome to CashFlow</b>
          </h4>
          <p>
            To get started, head over to the{" "}
            <strong>
              <a className="text-decoration-none text-dark" href="/settings">
                Settings
              </a>
            </strong>{" "}
            tab and securely link your bank account using Plaid.
          </p>
        </div>
      )}
    </div>
  );
}
