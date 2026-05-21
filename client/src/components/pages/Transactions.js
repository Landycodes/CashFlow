import React, { useContext, useEffect, useState } from "react";
import { getTransactionList } from "../../utils/API/transaction";
import { userContext } from "../../App";
import Loading from "../Loading";
import { setReferenceName } from "../../utils/API/xRef";

const PAGE_SIZE = 50;

// Helper component
const EditableCell = ({ value, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleBlur = () => {
    setEditing(false);
    if (val !== value) onSave(val);
  };

  return editing ? (
    <input
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === "Enter" && handleBlur()}
      className="form-control form-control-sm bg-dark text-light border-secondary"
    />
  ) : (
    <span onClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
      {val}
    </span>
  );
};

export default function Transactions() {
  // TODO: Create cross ref object before sending to server

  // ability to edit each row and relay that to database
  const { user, setUser, token } = useContext(userContext);
  // const [checked, setCheck] = useState(user.selectedAccount.bills || []);
  const [loadState, setLoadState] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const importTransactionList = async () => {
    const tx = await getTransactionList(token, page, PAGE_SIZE, search);
    setTransactions(tx.transactions);
    setTotalPages(tx.totalPages);
    setLoadState(false);
  };

  useEffect(() => {
    if (!token || !user || !user?.selected_account_id) {
      return;
    }

    importTransactionList();
  }, [token, user, page, search]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(debounce);
  }, [searchInput]);

  // const handleCheck = async (event, rowName) => {
  //   if (event.target.checked) {
  //     setCheck((prev) => [...prev, rowName]);
  //     await addBill(user._id, user.selected_account_id, rowName);
  //   } else {
  //     setCheck((prev) => prev.filter((name) => name !== rowName));
  //     await removeBill(user._id, user.selected_account_id, rowName);
  //   }
  // };

  // const filtered = transactions.filter((t) =>
  //   t.name?.toLowerCase().includes(search.toLowerCase()),
  // );

  // const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  // const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (e) => setSearchInput(e.target.value);

  const handleSaveCell = async (cell, newName) => {
    setLoadState(true);

    await setReferenceName(token, {
      ...cell,
      xref_name: newName,
    });

    importTransactionList();
  };

  if (loadState) return <Loading />;

  return (
    <div className="w-75 mb-5 d-flex flex-column align-items-center">
      <h3 className="style-text mb-4">Transaction Overview</h3>
      <div
        className="d-flex align-items-center justify-content-end w-75 mb-3"
        style={{ gap: "1rem" }}
      >
        <input
          type="text"
          className="form-control form-control-sm bg-gradient text-light border-secondary"
          placeholder="Search transactions..."
          value={searchInput}
          onChange={handleSearch}
          style={{ maxWidth: "260px" }}
        />
        <div className="d-flex align-items-center" style={{ gap: "0.5rem" }}>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &#8592;
          </button>
          <span
            className="text-secondary"
            style={{ fontSize: "13px", whiteSpace: "nowrap" }}
          >
            Page {page} of {totalPages || 1}
          </span>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
          >
            &#8594;
          </button>
        </div>
      </div>
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
                <td className="tx-td tx-name">
                  <EditableCell
                    value={row["xref.given_name"] ?? row.name}
                    onSave={(newName) => handleSaveCell(row, newName)}
                  />
                </td>
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
        <a href="#top">
          <button className="btn bg-gradient text-white w-100">
            Back To Top
          </button>
        </a>
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
