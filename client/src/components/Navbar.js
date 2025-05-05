import React, { useContext, useEffect, useState } from "react";
import Auth from "../utils/auth";
import { getMe } from "../utils/API";
import { userContext } from "./Content";

export default function Navbar({ currentPage, changePage }) {
  const user = useContext(userContext);
  const [name, setName] = useState(user.username);
  const [time, setTime] = useState("Time");
  const [date, setDate] = useState("Date");

  useEffect(() => {
    clock();
    getDate();
  }, []);

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
    <nav className="w-100 d-flex justify-content-end">
      <div className="d-flex justify-content-between w-100">
        <span className="m-2">
          <h6 className="dynamic-text bg-light border border-primary border-2 rounded p-1">
            {name} <span className="text-primary">|</span> {time}{" "}
            <span className="text-primary">|</span> {date}
          </h6>
        </span>
        <span className="m-2">
          <div className="dynamic-text menu-container d-flex  bg-light border border-primary border-2 rounded p-1 ps-1 pe-1">
            <h6
              className="menu-btn dynamic-text"
              onClick={() => {
                changePage("add");
              }}
            >
              Add
            </h6>
            <span className="text-primary m-1 dynamic-text">/</span>
            <h6
              className="menu-btn dynamic-text"
              onClick={() => {
                if (currentPage === "home") {
                  changePage("breakdown");
                } else {
                  changePage("home");
                }
              }}
            >
              {currentPage === "home" ? "Breakdown" : "Dashboard"}
            </h6>
            <span className="text-primary m-1 dynamic-text">/</span>
            <h6
              className="menu-btn dynamic-text"
              onClick={() => {
                changePage("settings");
              }}
            >
              Settings
            </h6>
            <span className="text-primary m-1 dynamic-text">/</span>
            <h6
              className="menu-btn dynamic-text"
              onClick={() => {
                Auth.logout();
              }}
            >
              Logout
            </h6>
          </div>
        </span>
      </div>

      {/* <p
          className="btn m-3 mx-4 p-2 border border-primary rounded bg-light bg-gradient"
          onClick={() => setMenu(!menu)}
        >
          menu
        </p>

      {menu ? (
        <div className="menu border border-primary rounded-start h-50">
          <ul className="list-unstyled bg-light bg-gradient rounded-start p-3 m-1 d-flex flex-column align-items-center">
            <li>
              <button
                className="btn btn-success"
                onClick={() => {
                  changePage("add");
                }}
              >
                Add Expense/Income
              </button>
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
                  setMenu(false);
                }}
              >
                {currentPage === "home" ? "Expense Breakdown" : "Dashboard"}
              </button>
            </li>
            <li>
              <button
                className="btn btn-light border border-primary"
                onClick={() => {
                  changePage("settings");
                  setMenu(false);
                }}
              >
                Settings
              </button>
            </li>
            <li>
              <button
                className="btn btn-danger"
                onClick={() => {
                  Auth.logout();
                  setMenu(false);
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
      )}*/}
    </nav>
  );
}
