import React, { useContext, useEffect, useState } from "react";
import { getTransactionList } from "../../utils/API";
import { userContext } from "../../App";

export default function Transactions() {
  //create function to iterate through expenses and incomes and add a row
  //ability to edit each row and relay that to database
  const [checked, setCheck] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const { user, setUser } = useContext(userContext);

  useEffect(() => {
    if (!user || !user?.selected_account_id) {
      return;
    }

    getTransactionList(user._id, user.selected_account_id).then((data) => {
      console.log(data);

      const txArr = [];

      data.forEach((tx) => {
        txArr.push({
          id: tx.transaction_id,
          date: tx.date,
          amount: tx.amount,
          name: tx.name,
          type: tx.type,
          category: null,
        });
      });

      setTransactions(txArr);
    });
  }, []);

  return (
    <div className="d-flex flex-column align-items-center">
      <table
        className="table table-sm align-middle table-striped table-bordered border-dark table-hover my-4"
        style={{ width: "60vw" }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>

            <th>Date</th>
            <th>Category</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => {
            return (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td
                  className={
                    row.type === "income" ? "table-success" : "table-danger"
                  }
                >
                  ${Math.abs(row.amount)}
                </td>
                <td>{row.date}</td>

                <td>{row.category}</td>
                <td style={{ width: "150px" }}>
                  <div className="d-flex justify-content-around">
                    <button className="btn btn-sm btn-secondary">Edit</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
