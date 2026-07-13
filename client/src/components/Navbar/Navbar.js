import style from "./Navbar.module.css";
import { useContext, useEffect, useState } from "react";
import Auth from "../../utils/auth";
import { userContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import { updateUser } from "../../utils/API/user";
import { getAllAccounts } from "../../utils/API/account";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

export default function Navbar() {
  const { user, setUser, token } = useContext(userContext);
  const name = user?.username;
  const [time, setTime] = useState("Time");
  const [date, setDate] = useState("Date");
  // const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clock();
    getDate();
  }, []);

  // const syncAccounts = async (token) => {
  //   const incomingAccounts = await getAllAccounts(token);
  //   if (incomingAccounts?.status) return;
  //   setAccounts(incomingAccounts);
  // };

  // useEffect(() => {
  //   syncAccounts(token);
  // }, [user]);

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
      className={`${style.navBar} w-100 d-flex justify-content-between bg-gradient`}
    >
      <span className={`${style.hud} mx-3 w-auto`}>
        <h6 className="style-text p-2 pt-3 mx-1 fs-4 text-nowrap">
          Welcome, {name}!
        </h6>
        <div className="d-flex flex-row align-items-center">
          {/* TODO: replace with real last updated value */}
          <i className="style-text pe-0 ps-3 pt-3 m-0 fs-5 text-nowrap">
            Last Updated:
          </i>
          <h6 className="style-text pe-0 ps-2 pt-3 m-0 fs-5 text-nowrap">
            {date} {time}
          </h6>
          {/* <h6 className="style-text p-2 pt-3 mx-1 fs-5 text-nowrap">{date}</h6>
          <h6 className="style-text p-2 pt-3 mx-1 fs-5 text-nowrap">{time}</h6> */}
        </div>
      </span>
      <DesktopNav
        style={style}
        // accounts={accounts}
        navigate={navigate}
        Auth={Auth}
      />
      <MobileNav
        setUser={setUser}
        style={style}
        navigate={navigate}
        Auth={Auth}
      />
    </nav>
  );
}
