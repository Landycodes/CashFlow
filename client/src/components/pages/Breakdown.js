import React, { useContext, useEffect, useState } from "react";
import Auth from "../../utils/auth";
import { getTransactionHistory } from "../../utils/API";
import { userContext } from "../Content";

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
          const newTransaction = {
            id: t.transaction_id,
            date: t.date,
            amount: t.amount,
            category: t.category.toString().split(",").join(", "),
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
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {
          setCheck(!checked);
        }}
      />
      <table className="table table-sm align-middle table-striped table-bordered border-dark">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {checked
            ? inArray.map((row) => {
                return (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>${Math.abs(row.amount)}</td>
                    <td>{row.category}</td>
                    <td className="w-25">
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
                    <td>{row.category}</td>
                    <td className="w-25">
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
