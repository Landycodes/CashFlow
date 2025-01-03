import React, { useEffect, useState } from "react";
import Auth from "../../utils/auth";
import { getMe } from "../../utils/API";

export default function Home() {
  //add a graph to show expense categories
  const [income, setIncome] = useState(0);
  const [expense, setexpense] = useState(0);
  const [range, setRange] = useState("total");

  const getUser = async () => {
    if (Auth.loggedIn()) {
      const token = Auth.getToken();
      await getMe(token).then((data) => {
        if (data.ok) {
          data.json().then((res) => {
            switch (range) {
              case "total":
                setIncome(res.Totalincome);
                setexpense(res.Totalexpense);
                break;
              case "oneWeek":
                setIncome(res.oneWeek.income);
                setexpense(res.oneWeek.expense);
                break;
              case "twoWeek":
                setIncome(res.twoWeek.income);
                setexpense(res.twoWeek.expense);
                break;
              case "oneMonth":
                setIncome(res.oneMonth.income);
                setexpense(res.oneMonth.expense);
                break;
              case "threeMonth":
                setIncome(res.threeMonth.income);
                setexpense(res.threeMonth.expense);
                break;
              case "sixMonth":
                setIncome(res.sixMonth.income);
                setexpense(res.sixMonth.expense);
                break;
              case "oneYear":
                setIncome(res.oneYear.income);
                setexpense(res.oneYear.expense);
                break;
              default:
            }
          });
        }
      });
    }
  };

  useEffect(() => {
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const handleChange = (event) => {
    setRange(event.target.value);
  };

  return (
    <div className="d-flex align-items-center justify-content-center mt-5">
      <div className="bg-light bg-gradient p-3 rounded border border-primary">
        <div>
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
        </div>
        <h1>
          Income: <span className="text-success">${income}</span>
        </h1>
        <h4 className="text-center">-</h4>
        <h1>
          Expenses: <span className="text-danger">${expense}</span>
        </h1>
        <hr style={{ height: "5px", backgroundColor: "black" }}></hr>
        <h1 className="text-center">
          Total:&nbsp;
          <span className={income >= expense ? "text-success" : "text-danger"}>
            {income >= expense ? "" : "-"}${Math.abs(income - expense)}
          </span>
        </h1>
      </div>
    </div>
  );
}
