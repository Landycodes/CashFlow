import { useEffect, useState, useContext } from "react";
import { userContext } from "../../App";
import AccountCard from "../cards/AccountCard";
import WelcomeCard from "../cards/WelcomeCard";
import CashFlowCard from "../cards/CashFlowCard";
import OverviewCard from "../cards/OverviewCard";
import BillsCard from "../cards/BillsCard";
import anime from "animejs";
import Loading from "../Loading";
import { PlaidPopUp } from "../../utils/Plaid";
import { getRecurringTransactions } from "../../utils/API";
import auth from "../../utils/auth";

export default function Dashboard({ token }) {
  const { user, setUser } = useContext(userContext);
  const { openPlaidPopUp } = PlaidPopUp(user._id);

  const rangeSelection = {
    ONE_YEAR: 365,
    SIX_MONTH: 182,
    THREE_MONTH: 91,
    ONE_MONTH: 30,
    TWO_WEEKS: 14,
    ONE_WEEK: 7,
  };

  const [range, setRange] = useState(rangeSelection.ONE_YEAR);

  const [accountInfoReady, SetaccountInfoReady] = useState(true);

  useEffect(() => {
    anime({
      targets: "#account-dash",
      translateY: [-200, -25],
      easing: "spring(2, 45, 12, 0)",
      duration: 500,
    });
  }, []);

  // const token = auth.getToken();
  // console.log(token);

  useEffect(() => {
    // console.log(user);
    if (!user?.plaidAccessToken) {
      openPlaidPopUp(token);
    } else {
      getRecurringTransactions(token).then((data) => console.log(data));
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
              <CashFlowCard
                range={range}
                setRange={setRange}
                rangeSelection={rangeSelection}
              />
              <OverviewCard range={range} />
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
