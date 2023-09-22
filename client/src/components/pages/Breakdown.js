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
    <div className="d-flex flex-column align-items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {
          setCheck(!checked);
        }}
      />
      <table className="table w-75">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {checked
            ? inArray.map((row) => {
                return (
                  <tr key={row._id}>
                    <td>{row.date}</td>
                    <td>{row.amount}</td>
                    <td>{row.category}</td>
                  </tr>
                );
              })
            : exArray.map((row) => {
                return (
                  <tr key={row._id}>
                    <td>{row.date}</td>
                    <td>{row.amount}</td>
                    <td>{row.category}</td>
                  </tr>
                );
              })}
        </tbody>
      </table>
    </div>
  );
}
