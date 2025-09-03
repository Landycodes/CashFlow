import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { userContext } from "../../App";
import { getTransactionRange } from "../../utils/API";

export default function TransactionsCard() {
  const { user } = useContext(userContext);
  const TX_COUNT = 12;
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getTransactionRange(user._id, user.selected_account_id, TX_COUNT).then(
      (res) => {
        setTransactions(res);
      }
    );
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center bg-light bg-gradient p-3 mx-5 rounded border border-primary"
      style={{ width: "325px" }}
    >
      <h3>Recent Transactions</h3>
      <table className="table table-sm align-middle table-striped table-bordered border-dark">
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>

            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => {
            return (
              <tr key={row._id}>
                <td>{row.name}</td>
                <td
                  className={
                    row.type === "income" ? "table-success" : "table-danger"
                  }
                >
                  ${Math.abs(row.amount)}
                </td>
                <td>{row.date}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
