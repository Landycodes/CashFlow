import { useEffect, useState } from "react";
import { useContext } from "react";
import { userContext } from "../../App";
import { getBills } from "../../utils/API";

export default function BillsCard() {
  const { user } = useContext(userContext);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    getBills(user._id, user.selected_account_id).then((data) => setBills(data));
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center bg-light bg-gradient p-3 mx-5 rounded border border-primary"
      style={{ width: "325px" }}
    >
      <h3>Bills</h3>
      {bills.map((bill) => {
        return (
          <ul
            key={bill.name}
            className="list-group list-group-flush list-unstyled w-100 border rounded border-black p-2"
          >
            <li>{bill.name}</li>
            <ul className="list-unstyled mx-5">
              <li>Amount: {bill.amount}</li>
              <li>Last Paid: {bill.date}</li>
            </ul>
          </ul>
        );
      })}
    </div>
  );
}
