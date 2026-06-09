import style from "./Navbar.module.css";
import { useContext, useEffect, useState } from "react";
import Auth from "../../utils/auth";
import { userContext } from "../../App";
import { useLocation, useNavigate } from "react-router-dom";
import { updateUser } from "../../utils/API/user";
import { getAccounts } from "../../utils/API/account";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

export default function Navbar() {
  const { user, setUser, token } = useContext(userContext);
  const name = user?.username;
  const [time, setTime] = useState("Time");
  const [date, setDate] = useState("Date");
  const [accounts, setAccounts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clock();
    getDate();
  }, []);

  useEffect(() => {
    getAccounts(token).then((data) => setAccounts(data));
  }, [user]);

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

  const handleAccountSelect = async (event) => {
    const updatedUser = await updateUser(token, {
      selected_account_id: event.target.value,
    });
    setUser(updatedUser);
  };

  return (
    <nav className="w-100 d-flex justify-content-between bg-gradient">
      <span className="mx-2 d-flex flex-row align-items-center justify-content-start w-auto">
        <h6 className="style-text p-2 pt-3 mx-1 fs-4 text-nowrap">
          Welcome, {name}!
        </h6>
        <h6 className="style-text p-2 pt-3 mx-1 fs-5 text-nowrap">{date}</h6>
        <h6 className="style-text p-2 pt-3 mx-1 fs-5 text-nowrap">{time}</h6>

        {accounts?.length > 1 ? (
          <select
            value={user.selected_account_id}
            onChange={handleAccountSelect}
            style={{ cursor: "pointer" }}
            className={`${style.selectBox} style-text form-select ms-3 ps-3 ps-1 fs-5`}
          >
            {accounts.map((acct) => {
              return (
                <option
                  className="fs-6 text-nowrap"
                  key={acct.account_id}
                  value={acct.account_id}
                >
                  {acct.name}
                </option>
              );
            })}
          </select>
        ) : (
          ""
        )}
      </span>
      <DesktopNav
        setUser={setUser}
        style={style}
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
