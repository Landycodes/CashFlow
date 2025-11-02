import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userContext } from "../../App";
import { getBills, getRecurringTransactions } from "../../utils/API";

export default function BillsCard() {
  const { user, token } = useContext(userContext);
  const [bills, setBills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // getBills(user._id, user.selected_account_id).then((data) => setBills(data));
    // getRecurringTransactions(token)
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center bg-light bg-gradient p-3 mx-5 rounded border border-primary"
      style={{ width: "325px" }}
    >
      <h3>Upcoming Bills</h3>

      {bills.length > 0 ? (
        bills.map((bill) => (
          <ul
            key={bill.name}
            className="list-group list-group-flush list-unstyled w-100 border rounded border-black p-2 m-1"
          >
            <li>{bill.name}</li>
            <ul className="list-unstyled mx-5">
              <li>Amount: {bill.amount}</li>
              <li>Last Paid: {bill.date}</li>
            </ul>
          </ul>
        ))
      ) : (
        <h3>No Upcoming Bills 🎉</h3>
      )}
      <button
        className="btn btn-light border m-3"
        onClick={() => navigate("/transactions")}
      >
        Edit Bills
      </button>
    </div>
  );
}
