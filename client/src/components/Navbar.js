import { useContext, useEffect, useState } from "react";
import Auth from "../utils/auth";
import { userContext } from "../App";
import { useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, setUser } = useContext(userContext);
  const name = user?.username;
  const [time, setTime] = useState("Time");
  const [date, setDate] = useState("Date");
  const navigate = useNavigate();
  const location = useLocation();

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
                navigate("/expenses");
              }}
            >
              Add
            </h6>
            <span className="text-primary m-1 dynamic-text">/</span>
            <h6
              className="menu-btn dynamic-text"
              onClick={() => {
                if (location.pathname === "/") {
                  navigate("/breakdown");
                } else {
                  navigate("/");
                }
              }}
            >
              {location.pathname === "/" ? "Breakdown" : "Dashboard"}
            </h6>
            <span className="text-primary m-1 dynamic-text">/</span>
            <h6
              className="menu-btn dynamic-text"
              onClick={() => {
                navigate("/settings");
              }}
            >
              Settings
            </h6>
            <span className="text-primary m-1 dynamic-text">/</span>
            <h6
              className="menu-btn dynamic-text"
              onClick={() => {
                Auth.logout() && setUser(null);
              }}
            >
              Logout
            </h6>
          </div>
        </span>
      </div>
    </nav>
  );
}
