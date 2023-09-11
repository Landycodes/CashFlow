import React, { useState } from "react";

export default function Login({ changePage }) {
  const [login, setlogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <div className="d-flex flex-column align-items-center">
      <header className="bg-light bg-gradient w-50 rounded-bottom d-flex flex-column align-items-center border border-dark border-top-0">
        <h2 className="m-0">CashFlow</h2>
        <h5>Track your spending</h5>
      </header>

      <form
        className="form d-flex flex-column justify-content-center align-items-center w-50 m-auto mt-3 mb-5 p-3 pt-4 rounded border border-secondary"
        onSubmit={handleSubmit}
      >
        {login ? (
          ""
        ) : (
          <input
            className="form-control w-50 m-1 border border-primary"
            type="text"
            placeholder="username"
          />
        )}
        <input
          className="form-control w-50 m-1 border border-primary"
          type="text"
          placeholder="Email"
        />
        <input
          className="form-control w-50 m-1 border border-primary"
          type="password"
          placeholder="Password"
        />
        <div className="d-flex flex-column justify-content-center align-items-center mt-2">
          <button
            className="btn btn-success w-50 m-1"
            onClick={() => changePage("home")}
          >
            Submit
          </button>
          <button
            className="btn btn-primary m-1"
            onClick={() => setlogin(!login)}
          >
            {login ? "Create Account" : "Log in instead"}
          </button>

          <h3 className="bg-light rounded w-25 text-center">-Or-</h3>
          <button className="btn btn-light m-1 bg-light bg-gradient border border-primary">
            <img
              src="/google-logo.png"
              alt=""
              height={25}
              width={25}
              style={{ marginRight: "10px" }}
            />
            sign in with Google
          </button>
        </div>
      </form>
    </div>
  );
}
