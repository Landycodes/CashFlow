import { useContext, useEffect, useState } from "react";
import Auth from "../utils/auth";
import { userContext } from "../App";
import { useLocation, useNavigate } from "react-router-dom";
import { updateUser } from "../utils/API";

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

  const handleAccountSelect = async (event) => {
    const updatedUser = await updateUser(user._id, {
      selected_account_id: event.target.value,
    });
    setUser(updatedUser);
  };

  return (
    <nav className="w-100 d-flex bg-gradient justify-content-between">
      <span className="mx-2 d-flex flex-row align-items-center justify-content-start w-auto">
        <h6 className="p-2 pt-3 mx-1 fs-4 text-nowrap">Welcome, {name}!</h6>
        <h6 className="p-2 pt-3 mx-1 fs-5 text-nowrap">{time}</h6>
        <h6 className="p-2 pt-3 mx-1 fs-5 text-nowrap">{date}</h6>
        {user?.selected_account_id && user.accounts.length > 1 ? (
          <select
            value={user.selected_account_id}
            onChange={handleAccountSelect}
            className="form-select ms-3 pe-5 ps-1 fs-5"
          >
            {user?.accounts ? (
              user.accounts.map((acct) => {
                return (
                  <option key={acct.account_id} value={acct.account_id}>
                    {acct.name}
                  </option>
                );
              })
            ) : (
              <option selected>No Account To Select From</option>
            )}
          </select>
        ) : (
          ""
        )}
      </span>
      <span className="d-flex flex-row mx-2">
        <h6 className="menu-btn p-3 pt-3" onClick={() => navigate("/expenses")}>
          Expenses
        </h6>
        <span className="rhombus"></span>
        <h6
          className="menu-btn p-3 pt-3 border-start border-secondary"
          onClick={() => navigate("/Transactions")}
        >
          Transactions
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
      </span>
    </nav>
  );
}
