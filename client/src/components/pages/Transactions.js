import React, { useContext, useEffect, useState } from "react";
import { getTransactionList } from "../../utils/API";
import { userContext } from "../../App";

export default function Transactions() {
  //create function to iterate through expenses and incomes and add a row
  //ability to edit each row and relay that to database
  const [checked, setCheck] = useState(true);
  // const [incomes, setincomes] = useState([]);
  // const [expenses, setexpenses] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const { user, setUser } = useContext(userContext);

  useEffect(() => {
    if (!user || !user?.selected_account_id) {
      return;
    }

    getTransactionList(user._id, user.selected_account_id).then((data) => {
      console.log(data);
      // const inArr = [];
      // const exArr = [];
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
        // if (tx.type === "income") {
        //   inArr.push({
        //     id: tx.transaction_id,
        //     date: tx.date,
        //     amount: tx.amount,
        //     name: tx.name,
        //     category: null,
        //   });
        // } else if (tx.type === "expense") {
        //   exArr.push({
        //     id: tx.transaction_id,
        //     date: tx.date,
        //     amount: tx.amount,
        //     name: tx.name,
        //     category: null,
        //   });
        // }
      });

      // setincomes(inArr);
      // setexpenses(exArr);
      setTransactions(txArr);
    });
  }, []);

  return (
    <div className="d-flex flex-column align-items-center">
      {/* <div>
        <button
          className={`btn rounded-0 ${checked ? "btn-light" : "btn-secondary"}`}
          onClick={() => setCheck(true)}
        >
          incomes
        </button>
        <button
          className={`btn rounded-0 ${checked ? "btn-secondary" : "btn-light"}`}
          onClick={() => setCheck(false)}
        >
          Expenses
        </button>
      </div> */}

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
            <th /* style={{ width: "150px" }} */></th>
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

        {/* <tbody>
          {checked
            ? incomes.map((row) => {
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
                      </div>
                    </td>
                  </tr>
                );
              })
            : expenses.map((row) => {
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
                      </div>
                    </td>
                  </tr>
                );
              })}
        </tbody> */}
      </table>
    </div>
  );
}
