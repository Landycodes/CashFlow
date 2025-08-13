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
    <nav className="w-100 d-flex justify-content-end bg-light">
      <div className="d-flex justify-content-between w-100">
        <span className="mx-2 d-flex flex-row border border-top-0 border-bottom-0 border-2 border-secondary">
          <h6 className="bg-light p-2 pt-3 mx-1">{name}</h6>
          <h6 className="bg-light p-2 pt-3 mx-1">{time}</h6>
          <h6 className="bg-light p-2 pt-3 mx-1">{date}</h6>
        </span>
        <span className="d-flex flex-row mx-2">
          <h6
            className="menu-btn p-3 pt-3 border-start border-secondary"
            onClick={() => navigate("/expenses")}
          >
            Expenses
          </h6>
          <h6
            className="menu-btn p-3 pt-3 border-start border-secondary"
            onClick={() => navigate("/breakdown")}
          >
            Breakdown
          </h6>
          <h6
            className="menu-btn p-3 pt-3 border-start border-secondary"
            onClick={() => navigate("/")}
          >
            Dashboard
          </h6>
          <h6
            className="menu-btn p-3 pt-3 border-start border-secondary"
            onClick={() => {
              navigate("/settings");
            }}
          >
            Settings
          </h6>
          <h6
            className="menu-btn p-3 pt-3 border-start border-end border-secondary"
            onClick={() => {
              Auth.logout() && setUser(null);
            }}
          >
            Logout
          </h6>
          {/* </div> */}
        </span>
      </div>
    </nav>
  );
}
