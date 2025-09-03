import { useEffect, useState, useContext } from "react";
import { userContext } from "../../App";
import PieChart from "../../utils/Piechart";
import AccountCard from "../cards/AccountCard";
import WelcomeCard from "../cards/WelcomeCard";
import CashFlowCard from "../cards/CashFlowCard";
import TransactionsCard from "../cards/TransactionsCard";
import BillsCard from "../cards/BillsCard";
import anime from "animejs";
import Loading from "../Loading";
import { PlaidPopUp } from "../../utils/Plaid";
import { getTransactionTotals } from "../../utils/API";

export default function Dashboard() {
  const { user, setUser } = useContext(userContext);
  const { openPlaidPopUp } = PlaidPopUp(user._id);

  const [accountInfoReady, SetaccountInfoReady] = useState(true);

  useEffect(() => {
    anime({
      targets: "#account-dash",
      translateY: [-200, -25],
      easing: "spring(2, 45, 12, 0)",
      duration: 500,
    });
  }, []);

  useEffect(() => {
    if (!user?.plaidAccessToken) {
      openPlaidPopUp();
    }
  }, [user]);

  if (user?.plaidAccessToken) {
    return (
      <>
        {accountInfoReady ? (
          <div className="d-flex flex-column justify-content-center align-items-center">
            <AccountCard />
            <div className="d-flex flex-row justify-content-between">
              <BillsCard />
              <CashFlowCard />
              <TransactionsCard />
            </div>
          </div>
        ) : (
          <Loading message={"Getting Bank Details"} />
        )}
      </>
    );
  } else {
    return (
      <div className="w-100 d-flex justify-content-center mt-5">
        <WelcomeCard />
      </div>
    );
  }
}
