import { useContext, useEffect, useState } from "react";
import { userContext } from "../../App";
import { updateUser } from "../../utils/API/user";

export default function DesktopNav({ style, accounts, navigate, Auth }) {
  const { user, setUser, token } = useContext(userContext);

  const handleAccountSelect = async (event) => {
    const updatedUser = await updateUser(token, {
      selected_account_id: event.target.value,
    });
    setUser(updatedUser);
  };

  return (
    <span className={`${style.desktopNav} mx-2`}>
      {accounts?.length > 1 ? (
        <select
          value={user.selected_account_id}
          onChange={handleAccountSelect}
          style={{ cursor: "pointer" }}
          className={`${style.selectBox} style-text form-select opacity-100 ms-3 ps-3 ps-1 fs-5`}
        >
          {accounts.map((acct) => {
            return (
              <option
                className="fs-6 text-nowrap"
                key={acct.id}
                value={acct.id}
              >
                {acct.name}
              </option>
            );
          })}
        </select>
      ) : (
        ""
      )}
      <h6
        className={`${style.menuBtn} style-text opacity-100 fs-4 rounded p-3 pt-3`}
        onClick={() => navigate("/expenses")}
      >
        Expenses
      </h6>
      <h6
        className={`${style.menuBtn} style-text opacity-100 fs-4 rounded p-3 pt-3`}
        onClick={() => navigate("/Transactions")}
      >
        Transactions
      </h6>
      <h6
        className={`${style.menuBtn} style-text opacity-100 fs-4 rounded p-3 pt-3`}
        onClick={() => navigate("/")}
      >
        Dashboard
      </h6>
      <h6
        className={`${style.menuBtn} style-text opacity-100 fs-4 rounded p-3 pt-3`}
        onClick={() => {
          navigate("/settings");
        }}
      >
        Settings
      </h6>
      <h6
        className={`${style.menuBtn} style-text opacity-100 fs-4 ${style.logOut} log-out rounded p-3 pt-3`}
        onClick={() => {
          Auth.logout();
          setUser(null);
        }}
      >
        Logout
      </h6>
    </span>
  );
}
