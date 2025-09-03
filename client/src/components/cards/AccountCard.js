import { useContext } from "react";
import { userContext } from "../../App";
import { useState } from "react";
import { useEffect } from "react";

export default function CurrentAccountInfo() {
  const { user } = useContext(userContext);
  const [accountDetails, setAccountDetails] = useState({
    name: null,
    balance: 0,
  });

  useEffect(() => {
    if (user?.selectedAccount) {
      setAccountDetails({
        name: user.selectedAccount.name,
        balance: user.selectedAccount.available_balance,
      });
    }
  }, [user]);

  return (
    <div
      className="d-flex flex-column align-items-center bg-light bg-gradient p-3 my-4 rounded border border-primary"
      style={{ minWidth: "350px" }}
    >
      <h3>{accountDetails.name}</h3>
      <h2>
        Current Balance:{" "}
        <span className="text-success text-nowrap">
          ${accountDetails.balance}
        </span>
      </h2>
    </div>
  );
}
