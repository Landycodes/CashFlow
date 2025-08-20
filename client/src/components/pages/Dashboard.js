import { useEffect, useState, useContext } from "react";
import { userContext } from "../../App";
import PieChart from "../Piechart";
import Loading from "../Loading";
import { PlaidPopUp } from "../../utils/Plaid";
import { getTransactions } from "../../utils/API";

export default function Dashboard() {
  const { user, setUser } = useContext(userContext);
  const { openPlaidPopUp } = PlaidPopUp(user._id);

  // TODO: add virtuals here to determine income for what account and time period based on account id and date info
  const [range, setRange] = useState("oneYear");
  const [accountInfoReady, SetaccountInfoReady] = useState(false);

  const [accountDetails, setAccountDetails] = useState({
    name: null,
    balance: null,
  });
  const [transactions, setTransactions] = useState({
    income: null,
    expense: null,
    total: null,
  });

  // const haveBankDetails = Object.values(bankDetails).every((v) => v !== null);
  // const isNegativeBalance = bankDetails.expense > bankDetails.income;

  useEffect(() => {
    console.log(user);

    // console.log(user["oneYear"]);
    if (!user?.plaidAccessToken) {
      openPlaidPopUp();
    } else if (user.accounts.length > 0) {
      const selectedAccount = user.accounts.find(
        (ac) => ac.account_id === user.selected_account_id
      );

      if (selectedAccount) {
        setAccountDetails({
          name: selectedAccount.name,
          balance: selectedAccount.available_balance,
        });
      }
      getTransactionTotals();

      SetaccountInfoReady(true);
    }
  }, []);

  const getTransactionTotals = async () => {
    const transactionList = await getTransactions(
      user._id,
      user.selected_account_id
    );
    const income = transactionList.income
      .reduce((sum, tx) => sum + tx.amount, 0)
      .toFixed(2);
    const expense = transactionList.expense
      .reduce((sum, tx) => sum + tx.amount, 0)
      .toFixed(2);

    setTransactions({
      income: income,
      expense: expense,
      total: income - expense,
    });
  };

  // useEffect(() => {
  //   setBankDetails({
  //     income: user[range].income,
  //     expense: user[range].expense,
  //     total: user[range].income - user[range].expense,
  //   });
  // }, [range]);

  const handleChange = (event) => {
    setRange(event.target.value);
  };

  const AccountDash = ({ accountDetails, transactions }) => {
    return (
      <div className="d-flex flex-column align-items-center bg-light bg-gradient p-3 rounded border border-primary">
        <h3>{accountDetails.name}</h3>
        <h2>
          Current Balance:{" "}
          <span className="text-success">${accountDetails.balance}</span>
        </h2>
        <div style={{ width: "225px", height: "225px" }} className="mt-2 mb-3">
          <PieChart
            data={{
              labels: ["Earned", "Spent"],
              values: [transactions.income, transactions.expense],
            }}
          />
        </div>

        <select
          className="w-100 mt-0 mb-2 btn btn-sm border border-2 border-primary rounded"
          value={range}
          onChange={handleChange}
        >
          <option value={"oneYear"}>1 Year</option>
          <option value={"sixMonth"}>6 months</option>
          <option value={"threeMonth"}>3 months</option>
          <option value={"oneMonth"}>1 month</option>
          <option value={"twoWeek"}>2 week</option>
          <option value={"oneWeek"}>1 week</option>
        </select>

        <hr style={{ height: "5px", backgroundColor: "black" }}></hr>

        <h1>
          Earned: <span className="text-success">${transactions.income}</span>
        </h1>
        <h4 className="text-center">-</h4>
        <h1>
          Expenses: <span className="text-danger">${transactions.expense}</span>
        </h1>
        <hr style={{ height: "5px", backgroundColor: "black" }}></hr>
        <h1 className="text-center">
          Total:&nbsp;
          <span
            className={transactions.total < 0 ? "text-danger" : "text-success"}
          >
            {transactions.total < 0 ? "-" : ""}$
            {Math.abs(transactions.total).toFixed(2)}
          </span>
        </h1>
      </div>
    );
  };

  const WelcomeScreen = () => {
    return (
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
    );
  };

  return (
    <div className="d-flex align-items-center justify-content-center mt-5">
      {user?.plaidAccessToken ? (
        accountInfoReady ? (
          <AccountDash
            accountDetails={accountDetails}
            transactions={transactions}
          />
        ) : (
          <Loading message={"Getting Bank Details"} />
        )
      ) : (
        <WelcomeScreen />
      )}
    </div>
  );
}
