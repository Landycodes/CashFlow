import React, { useContext, useEffect, useState } from "react";
import { getTransactionList, removeBill } from "../../utils/API";
import { userContext } from "../../App";
import { addBill } from "../../utils/API";

export default function Transactions() {
  //create function to iterate through expenses and incomes and add a row
  //ability to edit each row and relay that to database
  const { user, setUser, token } = useContext(userContext);
  const [checked, setCheck] = useState(user.selectedAccount.bills || []);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!token || !user || !user?.selected_account_id) {
      return;
    }

    getTransactionList(token).then((data) => {
      // console.log(data);
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
  }, [token, user]);

  const handleCheck = async (event, rowName) => {
    if (event.target.checked) {
      setCheck((prev) => [...prev, rowName]);
      await addBill(user._id, user.selected_account_id, rowName);
    } else {
      setCheck((prev) => prev.filter((name) => name !== rowName));
      await removeBill(user._id, user.selected_account_id, rowName);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center">
      <table
        className="table table-sm align-middle table-striped table-bordered border-dark table-hover my-4"
        style={{ width: "60vw" }}
      >
        <thead className="text-center">
          <tr>
            <th>Name</th>
            <th>Amount</th>

            <th>Date</th>
            <th>Category</th>
            <th>Bills</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((row) => {
            // console.log(row.amount);
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
                <td>
                  <div className="d-flex justify-content-around">
                    {row.type === "expense" ? (
                      <input
                        type="checkbox"
                        className={`btn ${row.name}`}
                        autoComplete="off"
                        checked={checked.includes(row.name) ? true : false}
                        onChange={(event) => handleCheck(event, row.name)}
                      />
                    ) : (
                      ""
                    )}
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
