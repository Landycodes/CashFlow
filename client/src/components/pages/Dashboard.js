import { useEffect, useState, useContext } from "react";
import { userContext } from "../../App";
import PieChart from "../Piechart";
import Loading from "../Loading";
import { PlaidPopUp } from "../../utils/Plaid";
import { getTransactionTotals } from "../../utils/API";

const ONE_YEAR = 365;
const SIX_MONTH = 182;
const THREE_MONTH = 91;
const ONE_MONTH = 30;
const TWO_WEEKS = 14;
const ONE_WEEK = 7;

export default function Dashboard() {
  const { user, setUser } = useContext(userContext);
  const { openPlaidPopUp } = PlaidPopUp(user._id);

  const [range, setRange] = useState(ONE_YEAR);
  const [accountInfoReady, SetaccountInfoReady] = useState(false);

  const [accountDetails, setAccountDetails] = useState({
    name: null,
    balance: 0,
  });
  const [transactions, setTransactions] = useState({
    income: 0,
    expense: 0,
    total: 0,
  });

  useEffect(() => {
    if (!user?.plaidAccessToken) {
      openPlaidPopUp();
    } else if (user.selected_account_id) {
      const selectedAccount = user.accounts.find(
        (ac) => ac.account_id === user.selected_account_id
      );

      if (selectedAccount) {
        setAccountDetails({
          name: selectedAccount.name,
          balance: selectedAccount.available_balance,
        });
      }

      getTransactionAmounts(range).then(() => {
        SetaccountInfoReady(true);
      });
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

  // useEffect(() => {
  //   getTransactionAmounts(range);
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
          className="w-100 mt-0 mb-2 btn btn-sm border border-2 border-primary rounded"
          value={range}
          onChange={handleChange}
        >
          <option value={ONE_YEAR}>1 Year</option>
          <option value={SIX_MONTH}>6 months</option>
          <option value={THREE_MONTH}>3 months</option>
          <option value={ONE_MONTH}>1 month</option>
          <option value={TWO_WEEKS}>2 week</option>
          <option value={ONE_WEEK}>1 week</option>
        </select>

        <hr style={{ height: "5px", backgroundColor: "black" }}></hr>

        <h3>
          Deposited:{" "}
          <span className="text-success">${transactions.income}</span>
        </h3>
        {/* <h4 className="text-center">-</h4> */}
        <hr style={{ height: "3px", backgroundColor: "black" }}></hr>

        <h3>
          Withdrawn:{" "}
          <span className="text-danger">${transactions.expense}</span>
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
