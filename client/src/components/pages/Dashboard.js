import React, { useEffect, useState, useContext } from "react";
// import Auth from "../../utils/auth";
import { getAccountBalance, getTransactionHistory } from "../../utils/API";
import { userContext } from "../../App";
import PieChart from "../Piechart";
import Loading from "../Loading";

export default function Dashboard() {
  //add a graph to show expense categories
  const [range, setRange] = useState("total");
  const [bankDetails, setBankDetails] = useState({
    balance: null,
    income: null,
    expense: null,
  });
  const haveBankDetails = Object.values(bankDetails).every((v) => v !== null);
  const isNegativeBalance = bankDetails.expense > bankDetails.income;
  const userObject = useContext(userContext);
  const user = userObject.user;

  useEffect(() => {
    // console.log(user);
    if (user && user.plaidAccessToken) {
      getAccountBalance(user.plaidAccessToken).then((data) => {
        setBankDetails((bd) => ({
          ...bd,
          balance: data[0].balances.available,
        }));
      });
      getTransactionHistory(user.plaidAccessToken).then((data) => {
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
      });
    }
  }, []);

  // console.log(user.plaidAccessToken);

  // useEffect(() => {
  //   // console.log(user);
  //   if (Auth.loggedIn()) {
  //     const token = Auth.getToken();
  //     getMe(token).then((data) => {
  //       if (data.ok) {
  //         data.json().then((userData) => {
  //           getAccountBalance(userData.plaidAccessToken).then((res) => {
  //             setIncome(res[0].balances.available);
  //             // console.log(res);
  //           });
  //         });
  //       }
  //     });
  //   }
  // }, []);

  // const getUser = async () => {
  //   if (Auth.loggedIn()) {
  //     const token = Auth.getToken();
  //     await getMe(token).then((data) => {
  //       if (data.ok) {
  //         data.json().then((res) => {
  //           switch (range) {
  //             case "total":
  //               setIncome(res.Totalincome);
  //               setexpense(res.Totalexpense);
  //               break;
  //             case "oneWeek":
  //               setIncome(res.oneWeek.income);
  //               setexpense(res.oneWeek.expense);
  //               break;
  //             case "twoWeek":
  //               setIncome(res.twoWeek.income);
  //               setexpense(res.twoWeek.expense);
  //               break;
  //             case "oneMonth":
  //               setIncome(res.oneMonth.income);
  //               setexpense(res.oneMonth.expense);
  //               break;
  //             case "threeMonth":
  //               setIncome(res.threeMonth.income);
  //               setexpense(res.threeMonth.expense);
  //               break;
  //             case "sixMonth":
  //               setIncome(res.sixMonth.income);
  //               setexpense(res.sixMonth.expense);
  //               break;
  //             case "oneYear":
  //               setIncome(res.oneYear.income);
  //               setexpense(res.oneYear.expense);
  //               break;
  //             default:
  //           }
  //         });
  //       }
  //     });
  //   }
  // };

  // useEffect(() => {
  //   getUser();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [range]);

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
          // <div className="bg-light bg-gradient p-3 rounded border border-primary">
          //   <h4>Getting Bank Details...</h4>
          // </div>
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
