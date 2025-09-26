import { useEffect } from "react";
import { useContext } from "react";
import { userContext } from "../../App";
import { getBills } from "../../utils/API";

export default function BillsCard() {
  const { user } = useContext(userContext);

  useEffect(() => {
    const bills = getBills(user._id, user.selected_account_id).then((data) =>
      console.log(data)
    );
  }, []);

  return (
    <div
      className="d-flex flex-column align-items-center bg-light bg-gradient p-3 mx-5 rounded border border-primary"
      style={{ width: "325px" }}
    >
      <h3>Bills</h3>
    </div>
  );
}
