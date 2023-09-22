import React, { useEffect, useState } from "react";
import Auth from "../utils/auth";
import { getMe } from "../utils/API";

export default function Navbar({ currentPage, changePage }) {
  const [menu, setMenu] = useState(false);

  const [name, setName] = useState("Name");
  const [time, setTime] = useState("Time");
  const [date, setDate] = useState("Date");

  useEffect(() => {
    getUser();
    clock();
    getDate();
  }, []);

  const getUser = async () => {
    if (Auth.loggedIn()) {
      const token = Auth.getToken();
      await getMe(token).then((data) => {
        if (data.ok) {
          data.json().then((res) => {
            setName(res.username);
          });
        }
      });
    }
  };

  const clock = () => {
    let time = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
    setTime(time);
  };
  setInterval(() => {
    clock();
  }, 10000);

  const getDate = () => {
    const day = new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    setDate(`${month}/${day}/${year}`);
  };

  return (
    <nav
      className="d-flex justify-content-end"
      // onClick={(event) => {
      //   console.log(event.target);
      // }}
    >
      <div className="d-flex justify-content-between w-100">
        <span className="m-2">
          <h5 className="bg-light border border-primary border-2 rounded p-1">
            {name} <span className="text-primary">|</span> {time}{" "}
            <span className="text-primary">|</span> {date}
          </h5>
        </span>
        <p
          className="btn m-3 mx-4 p-2 border border-primary rounded bg-light bg-gradient"
          onClick={() => setMenu(!menu)}
        >
          menu
        </p>
      </div>

      {menu ? (
        <div className="menu border border-primary rounded-start h-50">
          <ul className="list-unstyled bg-light bg-gradient rounded-start p-3 m-1 d-flex flex-column align-items-center">
            <li>
              <button className="btn btn-success">Add Expense/Income</button>
            </li>
            <li>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (currentPage === "home") {
                    changePage("breakdown");
                  } else {
                    changePage("home");
                  }
                }}
              >
                {currentPage === "home" ? "Expense Breakdown" : "Dashboard"}
              </button>
            </li>
            <li>
              <button className="btn btn-light border border-primary">
                Settings
              </button>
            </li>
            <li>
              <button
                className="btn btn-danger"
                onClick={() => {
                  Auth.logout();
                  // changePage("login")
                }}
              >
                Log Out
              </button>
            </li>
          </ul>
        </div>
      ) : (
        ""
      )}
    </nav>
  );
}
