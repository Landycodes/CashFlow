import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userContext } from "../../App";
import { getAllRecurring } from "../../utils/API/recurring";
import formatDate from "../../utils/dateFormatter";

export default function BillsCard() {
  const { user, token } = useContext(userContext);
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAllRecurring(token, { type: "BILL", limit: 10 }).then((data) => {
      // console.log(data);
      setBills(data);
    });
  }, [user]);

  return (
    <div
      className="window-style d-flex flex-column align-items-center mx-5 mt-2"
      style={{
        width: "500px",
        height: "500px",
      }}
    >
      <h3 className="style-text">Upcoming Bills</h3>

      <div>
        {bills?.length > 0 ? (
          <div className="tx-table-wrap">
            <table className="tx-table table table-dark table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th className="tx-th">Name</th>
                  <th className="tx-th">Amount</th>
                  <th className="tx-th">Due</th>
                  <th className="tx-th">Days Away</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr className="tx-row" key={bill.id}>
                    <td className="tx-td tx-name py-2 px-3">{bill.name}</td>
                    <td className="border border-0 py-2 px-3">
                      ${Number(bill.amount).toLocaleString()}
                    </td>
                    <td className="border border-0 fw-medium py-2 px-3 text-nowrap">
                      {formatDate(bill.next_due)}
                    </td>
                    <td
                      className={`border border-0 py-2 px-3 text-nowrap ${
                        bill.days_away <= 3
                          ? "text-danger"
                          : bill.days_away <= 7
                            ? "text-warning"
                            : "text-secondary"
                      }`}
                    >
                      {bill.days_away}d
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <h3>No Upcoming Bills 🎉</h3>
        )}
      </div>

      <button
        className="btn btn-light mt-2 border"
        onClick={() => navigate("/transactions")}
      >
        Edit Bills
      </button>
    </div>
  );
}
