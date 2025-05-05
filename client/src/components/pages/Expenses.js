import React, { useContext, useEffect, useState } from "react";
import { getTransactionHistory } from "../../utils/API";
import { userContext } from "../Content";

export default function Expenses() {
  const [newCat, setCat] = useState(false);
  const [categories, setCategories] = useState(["1", "2", "3"]);
  const user = useContext(userContext);

  const [form, setForm] = useState({
    date: "",
    amount: "",
    category: "",
  });

  useEffect(() => {
    console.log(user);
    if (user) {
      getTransactionHistory(user.plaidAccessToken).then((data) => {
        console.log(data);
      });
    }
  }, []);

  const handleInput = (event) => {
    const value = event.target.value;
    const name = event.target.id;
    setForm({ ...form, [name]: value });
  };
  return (
    <div className="d-flex flex-column align-items-center">
      <form
        className="bg-light p-3 rounded border border-primary d-flex flex-column justify-content-between"
        onChange={handleInput}
        onSubmit={(event) => {
          event.preventDefault();
          console.log(form);
        }}
      >
        <input type="checkbox" />
        <label htmlFor="amount">
          Amount:
          <input id="amount" required />
        </label>
        <label htmlFor="category">
          Category:
          <select
            id="category"
            onChange={(event) => {
              if (event.target.value === "new") {
                setCat(true);
              } else {
                setCat(false);
              }
            }}
            required
          >
            <option>Select category</option>
            {categories.map((item, index) => {
              return (
                <option key={index} value={item}>
                  {item}
                </option>
              );
            })}
            <option value={"new"}>add new Category</option>
          </select>
        </label>
        {newCat ? (
          <div>
            <input placeholder="enter category" />
            <button className="btn btn-sm btn-success">save</button>
          </div>
        ) : (
          ""
        )}
        <label htmlFor="date">
          Date:
          <input id="date" type="date" required />
        </label>
        <button>submit</button>
      </form>
    </div>
  );
}
