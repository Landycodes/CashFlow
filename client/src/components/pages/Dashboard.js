import { useEffect, useState, useContext } from "react";
import { userContext } from "../../App";
import AccountCard from "../cards/AccountCard";
import WelcomeCard from "../cards/WelcomeCard";
import CashFlowCard from "../cards/CashFlowCard";
import OverviewCard from "../cards/OverviewCard";
import BillsCard from "../cards/BillsCard";
import CalendarCard from "../cards/CalenderCard";
import anime from "animejs";
import Loading from "../Loading";
import { PlaidPopUp } from "../../utils/Plaid";

export default function Dashboard() {
  const { user, token, plaidAuthExpired } = useContext(userContext);
  const { openPlaidPopUp } = PlaidPopUp();

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

  useEffect(() => {
    if (!user?.plaidAccessToken || plaidAuthExpired) {
      openPlaidPopUp();
    }
  }, [user]);

  const handleRangeChange = (rangeVal) => {
    setRange(rangeVal);
  };

  const rangeBtn = (rangeVal, label) => {
    const isActive = range === rangeVal;
    return (
      <button
        type="button"
        value={rangeVal}
        onClick={() => handleRangeChange(rangeVal)}
        className={`style-text fs-5 btn btn-outline-secondary border-0 ${
          isActive ? "active bg-light text-dark" : "text-light opacity-75"
        }`}
      >
        {label}
      </button>
    );
  };

  if (user?.plaidAccessToken) {
    return (
      <>
        {accountInfoReady ? (
          <>
            <div className="d-flex flex-row justify-content-center align-items-center m-4 gap-3">
              <div className="d-flex flex-column justify-content-center align-items-end gap-3">
                <div className="d-flex align-self-start mx-5 gap-2 bg-gradient rounded border border-secondary">
                  {rangeBtn(rangeSelection.ONE_WEEK, "1W")}
                  {rangeBtn(rangeSelection.TWO_WEEKS, "2W")}
                  {rangeBtn(rangeSelection.ONE_MONTH, "1M")}
                  {rangeBtn(rangeSelection.THREE_MONTH, "3M")}
                  {rangeBtn(rangeSelection.SIX_MONTH, "6M")}
                  {rangeBtn(rangeSelection.ONE_YEAR, "YTD")}
                </div>
                <CashFlowCard
                  range={range}
                  setRange={setRange}
                  rangeSelection={rangeSelection}
                />
                <OverviewCard range={range} />
              </div>
              <div className="d-flex flex-column align-self-start justify-content-center align-items-center gap-3">
                <AccountCard />
                <BillsCard />
              </div>
              <div className="d-flex flex-column justify-content-center align-items-center gap-5">
                <CalendarCard />
              </div>
            </div>
          </>
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
