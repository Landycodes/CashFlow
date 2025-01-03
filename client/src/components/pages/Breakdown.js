import React, { useEffect, useState } from "react";
import { getMe } from "../../utils/API";
import Auth from "../../utils/auth";

export default function Breakdown() {
  //create function to iterate through expenses and income and add a row
  //ability to edit each row and relay that to database
  const [checked, setCheck] = useState(true);
  const [inArray, setInArray] = useState([]);
  const [exArray, setExArray] = useState([]);

  const getUser = async () => {
    if (Auth.loggedIn()) {
      const Token = Auth.getToken();
      try {
        await getMe(Token).then(async (data) => {
          if (data.ok) {
            const user = await data.json();
            setInArray(user.income);
            setExArray(user.expense);
            console.log(user.income);
          }
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      Auth.logout();
    }
  };

  useEffect(() => {
    getUser();
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
                  <tr key={row._id}>
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
              })
            : exArray.map((row) => {
                return (
                  <tr key={row._id}>
                    <td>{row.date}</td>
                    <td>-${row.amount}</td>
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
