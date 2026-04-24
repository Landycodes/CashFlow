import React, { useContext, useEffect, useState } from "react";
import { getTransactionList } from "../../utils/API/transaction";
import { userContext } from "../../App";
import Loading from "../Loading";

export default function Transactions() {
  //create function to iterate through expenses and incomes and add a row
  //ability to edit each row and relay that to database
  const { user, setUser, token } = useContext(userContext);
  // const [checked, setCheck] = useState(user.selectedAccount.bills || []);
  const [loadState, setLoadState] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!token || !user || !user?.selected_account_id) {
      return;
    }

    getTransactionList(token).then((data) => {
      setTransactions(data);
      setLoadState(false);
    });
  }, [token, user]);

  // const handleCheck = async (event, rowName) => {
  //   if (event.target.checked) {
  //     setCheck((prev) => [...prev, rowName]);
  //     await addBill(user._id, user.selected_account_id, rowName);
  //   } else {
  //     setCheck((prev) => prev.filter((name) => name !== rowName));
  //     await removeBill(user._id, user.selected_account_id, rowName);
  //   }
  // };

  if (loadState) return <Loading />;

  return (
    <div className="w-75 d-flex flex-column align-items-center">
      <h3 className="style-text mb-4">Transaction Overview</h3>
      <div className="tx-table-wrap" style={{ width: "60vw" }}>
        <table className="table table-dark table-striped table-sm align-middle mb-0 tx-table">
          <thead>
            <tr>
              <th className="tx-th">Name</th>
              <th className="tx-th">Amount</th>
              <th className="tx-th">Date</th>
              <th className="tx-th">Category</th>
              <th className="tx-th text-center">Bill</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((row) => (
              <tr className="tx-row" key={row.transaction_id}>
                <td className="tx-td tx-name">{row.name}</td>
                <td
                  className={`tx-td ${row.type === "INCOME" ? "tx-income" : "tx-expense"}`}
                >
                  {row.type === "INCOME" ? "+" : "−"} ${row.amount}
                </td>
                <td className="tx-td fw-medium">{row.date}</td>
                <td className="tx-td">
                  <span className="tx-badge">{row.category}</span>
                </td>
                <td className="tx-td text-center">
                  {row.type === "expense" && (
                    <input type="checkbox" className="tx-check" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    // <div className="window-style w-75 d-flex flex-column align-items-center">
    //   <h3 className="style-text">Transaction Overview</h3>
    //   <table
    //     className="table table-sm align-middle table-striped table-bordered border-secondary table-dark table-hover my-4"
    //     style={{ width: "60vw" }}
    //   >
    //     <thead className="text-center">
    //       <tr>
    //         <th>Name</th>
    //         <th>Amount</th>

    //         <th>Date</th>
    //         <th>Category</th>
    //         <th>Bills</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {transactions.map((row) => {
    //         // console.log(row.amount);
    //         return (
    //           <tr key={row.transaction_id}>
    //             <td>{row.name}</td>
    //             <td
    //               className={
    //                 row.type === "INCOME" ? "table-success" : "table-danger"
    //               }
    //             >
    //               {row.type === "INCOME" ? "+" : "-"} ${row.amount}
    //             </td>
    //             <td>{row.date}</td>

    //             <td>{row.category}</td>
    //             <td>
    //               <div className="d-flex justify-content-around">
    //                 {row.type === "expense" ? (
    //                   <input
    //                     type="checkbox"
    //                     className={`btn ${row.name}`}
    //                     autoComplete="off"
    //                     // checked={checked.includes(row.name) ? true : false}
    //                     // onChange={(event) => handleCheck(event, row.name)}
    //                   />
    //                 ) : (
    //                   ""
    //                 )}
    //               </div>
    //             </td>
    //           </tr>
    //         );
    //       })}
    //     </tbody>
    //   </table>
    // </div>
  );
}
