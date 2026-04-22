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
      className="d-flex flex-column align-items-center bg-gradient p-3 mx-5 mt-2 rounded border border-secondary"
      style={{
        width: "500px",
        height: "500px",
      }}
    >
      <h3 className="style-text">Upcoming Bills</h3>

      <div>
        {bills?.length > 0 ? (
          <table className="table table-dark table-bordered table-hover table-sm mb-0">
            <thead>
              <tr className="border-secondary">
                <th className="text-secondary fw-normal py-2 px-3">Name</th>
                <th className="text-secondary fw-normal py-2 px-3">Amount</th>
                <th className="text-secondary fw-normal py-2 px-3">Due</th>
                <th className="text-secondary fw-normal py-2 px-3">
                  Days Away
                </th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td className="py-2 px-3">{bill.name}</td>
                  <td className="py-2 px-3">
                    ${Number(bill.amount).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-nowrap">
                    {formatDate(bill.next_due)}
                  </td>
                  <td
                    className={`py-2 px-3 text-nowrap ${
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
