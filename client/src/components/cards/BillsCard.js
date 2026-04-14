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
    getAllRecurring(token, { type: "BILL", limit: 10 }).then((data) =>
      setBills(data),
    );
  }, [user]);

  return (
    <div
      className="d-flex flex-column align-items-center bg-gradient p-3 mx-5 mt-2 rounded border border-secondary"
      style={{
        width: "500px",
        height: "400px",
      }}
    >
      <h3 className="text-light text-opacity-75">Upcoming Bills</h3>

      <div
        style={{
          overflow: "scroll",
          overflowX: "hidden",
        }}
      >
        {bills?.length > 0 ? (
          bills.map((bill) => (
            <ul
              key={bill.id}
              className="info-text list-group list-group-flush list-unstyled w-100 border border-2 border-secondary rounded p-2 m-1 mt-2"
            >
              <li className="d-flex justify-content start">
                <h5 className="border border-secondary rounded bg-dark p-2 px-3 my-2 mx-3">
                  {bill.name}
                </h5>
              </li>
              <ul className="d-flex justify-content-between list-unstyled mx-5">
                <div className="d-flex flex-column justify-content-between gap-2">
                  <li className="d-flex flex-column bg-dark border border-secondary rounded p-2">
                    Amount
                    <h4 className="mx-4">
                      ${Number(bill.amount).toLocaleString()}
                    </h4>
                  </li>

                  <li className="d-flex flex-column bg-dark border border-secondary rounded p-2">
                    Last Paid
                    <h4 className="mx-4 text-nowrap">
                      {formatDate(bill.last_paid)}
                    </h4>
                  </li>
                </div>

                <div className="d-flex flex-column justify-content-between gap-2">
                  <li className="d-flex flex-column bg-dark border border-secondary rounded p-2">
                    Due
                    <h4 className="mx-4 text-nowrap">
                      {bill.frequency.charAt(0) +
                        bill.frequency.slice(1).toLowerCase()}
                    </h4>
                  </li>
                  <li className="d-flex flex-column bg-dark border border-secondary rounded p-2">
                    Next Payment
                    <h4 className="mx-4 text-nowrap">
                      {formatDate(bill.next_due)}
                    </h4>
                  </li>
                </div>
              </ul>
            </ul>
          ))
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
