import React, { useState } from "react";

export default function Navbar({ currentPage, changePage }) {
  const [menu, setMenu] = useState(false);
  return (
    <nav
      className="d-flex justify-content-end"
      onClick={(event) => {
        console.log(event.target);
      }}
    >
      <p
        className="btn m-3 mx-4 p-2 border border-primary rounded bg-light bg-gradient"
        onClick={() => setMenu(!menu)}
      >
        menu
      </p>
      {menu ? (
        <div className="menu border border-primary rounded-start h-50">
          <ul className="list-unstyled bg-light bg-gradient rounded-start p-3 m-1 d-flex flex-column align-items-center">
            <li>
              <button className="btn btn-success">Add Expense/Income</button>
            </li>
            <li>
              <button className="btn btn-primary">Expense Breakdown</button>
            </li>
            <li>
              <button className="btn btn-light border border-primary">
                Settings
              </button>
            </li>
            <li>
              <button className="btn btn-danger">Log Out</button>
            </li>
          </ul>
        </div>
      ) : (
        ""
      )}

      {/* <button
        className="btn btn-danger border border-primary bg-gradient m"
        onClick={() => changePage("login")}
      >
        Logout
      </button>
      <ul className="list-unstyled d-flex justify-content-between w-25">
        <li onClick={() => changePage("home")}>Home</li>
        <li onClick={() => changePage("breakdown")}>breakdown</li>
      </ul> */}
    </nav>
  );
}
