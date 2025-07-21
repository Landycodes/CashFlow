import React, { useContext, useEffect, useState } from "react";
import { getTransactionHistory } from "../../utils/API";
import { userContext } from "../../App";

export default function Breakdown() {
  //create function to iterate through expenses and income and add a row
  //ability to edit each row and relay that to database
  const [checked, setCheck] = useState(true);
  const [inArray, setInArray] = useState([]);
  const [exArray, setExArray] = useState([]);
  const user = useContext(userContext);

  useEffect(() => {
    if (!user) {
      return;
    }

    getTransactionHistory(user.plaidAccessToken).then((transaction) => {
      const updatedInputArr = [...inArray];
      const updatedExpenseArr = [...exArray];

      transaction.forEach((t) => {
        const exists =
          updatedInputArr.some((obj) => obj.id === t.transaction_id) &&
          updatedExpenseArr.some((obj) => obj.id === t.transaction_id);

        if (!exists) {
          console.log(t);
          const newTransaction = {
            id: t.transaction_id,
            date: t.date,
            amount: t.amount,
            name: t.merchant_name ?? t.name,
            category: t.category?.toString().split(",").join(", "),
          };

          if (t.amount < 0) {
            updatedInputArr.push(newTransaction);
          } else {
            updatedExpenseArr.push(newTransaction);
          }
        }
        setInArray(updatedInputArr);
        setExArray(updatedExpenseArr);
      });
    });
  }, []);

  return (
    <div className="d-flex flex-column align-items-center container table-responsive">
      {/* <input
        type="checkbox"
        checked={checked}
        onChange={() => {
          setCheck(!checked);
        }}
      /> */}
      <div>
        <button
          className={`btn rounded-0 ${checked ? "btn-light" : "btn-secondary"}`}
          onClick={() => setCheck(true)}
        >
          Income
        </button>
        <button
          className={`btn rounded-0 ${checked ? "btn-secondary" : "btn-light"}`}
          onClick={() => setCheck(false)}
        >
          Expenses
        </button>
      </div>

      <table className="table table-sm align-middle table-striped table-bordered border-dark">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Name</th>
            <th>Category</th>
            <th style={{ width: "150px" }}></th>
          </tr>
        </thead>
        <tbody>
          {checked
            ? inArray.map((row) => {
                return (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>${Math.abs(row.amount)}</td>
                    <td>{row.name}</td>
                    <td>{row.category}</td>
                    <td style={{ width: "150px" }}>
                      <div className="d-flex justify-content-around">
                        <button className="btn btn-sm btn-secondary">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            : exArray.map((row) => {
                return (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>${row.amount}</td>
                    <td>{row.name}</td>
                    <td>{row.category}</td>
                    <td style={{ width: "150px" }}>
                      <div className="d-flex justify-content-around">
                        <button className="btn btn-sm btn-secondary">
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger">
                          Delete
                        </button>
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
