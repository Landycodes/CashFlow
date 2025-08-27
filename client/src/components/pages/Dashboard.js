import { useEffect, useState, useContext } from "react";
import { userContext } from "../../App";
import PieChart from "../Piechart";
import anime from "animejs";
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

  useEffect(() => {
    anime({
      targets: "#account-dash",
      translateY: [-200, -25],
      easing: "spring(2, 45, 12, 0)",
      duration: 500,
    });
  }, []);

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
    } else if (user.selectedAccount) {
      setAccountDetails({
        name: user.selectedAccount.name,
        balance: user.selectedAccount.available_balance,
      });

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
          className="form-select text-center border-primary py-1"
          id="floatingSelect"
          value={range}
          onChange={handleChange}
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
    <div
      className="d-flex align-items-center justify-content-center mt-5"
      id="account-dash"
    >
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
