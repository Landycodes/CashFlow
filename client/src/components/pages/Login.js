import React, { useState, useEffect } from "react";
import { createUser, loginUser } from "../../utils/API";
import Auth from "../../utils/auth";
import anime from "animejs";

export default function Login({ changePage }) {
  //fix signup bug
  //add firebase signin with google
  const [login, setlogin] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});

  useEffect(() => {
    anime({
      targets: "#loginForm",
      translateY: [-200, -25], // Move up past center
      easing: "spring(2, 45, 12, 0)",
      duration: 500,
    });
  }, []);

  //reset states when form changes between log in and sign up
  useEffect(() => {
    setForm({});
    setError("");
    document.querySelectorAll("input").forEach((i) => (i.value = ""));
  }, [login]);

  //set state to input value
  const handleInputChange = (event) => {
    setError("");
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const getLogIndata = async () => {
    await loginUser(form).then((data) => {
      if (data) {
        const success = data.ok;
        data.json().then((user) => {
          if (success) {
            Auth.login(user.token);
            changePage("home");
          } else {
            setError(user.message);
            document.querySelectorAll("input").forEach((input) => {
              input.value = "";
            });
          }
        });
      }
    });
  };

  const getSignUpData = async () => {
    await createUser(form).then((user) => {
      console.log(user);
      if (user) {
        if (user.ok) {
          Auth.login(user.token);
          changePage("home");
        } else {
          setError(user.message);
          document.querySelectorAll("input").forEach((input) => {
            input.value = "";
          });
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const btnDisable = (Boolean) => {
      document.querySelectorAll("button").forEach((btn) => {
        btn.disabled = Boolean;
      });
    };

    if (login) {
      try {
        btnDisable(true);
        getLogIndata();
      } catch (error) {
        console.error(error);
      } finally {
        btnDisable(false);
      }
    } else {
      try {
        btnDisable(true);
        getSignUpData();
      } catch (err) {
        console.log(err);
      } finally {
        btnDisable(false);
      }
    }
  };

  const throwError = (error) => {
    return error !== "" ? (
      <div className="border border-danger rounded bg-light w-75 text-center">
        {error}
      </div>
    ) : null;
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      {/* <header className="bg-light bg-gradient w-100 d-flex flex-column align-items-center border border-dark border-top-0">
        <h2 className="m-0">CashFlow</h2>
        <h5>Track your spending</h5>
      </header> */}

      <form
        className="form d-flex flex-column justify-content-center align-items-center p-3 pt-4 rounded border bg-light"
        id="loginForm"
        style={{ transform: "translateY(-25%)" }}
        onSubmit={handleSubmit}
      >
        <header className="bg-light bg-gradient w-100 d-flex flex-column align-items-center">
          <h2 className="m-0">CashFlow</h2>
          <h5>Track your spending</h5>
        </header>

        <br></br>

        {login ? (
          ""
        ) : (
          <input
            className="form-control w-75 m-1 border border-primary dynamic-text"
            type="text"
            placeholder="username"
            onChange={handleInputChange}
            name="username"
            defaultValue={form.username}
          />
        )}
        <input
          className="form-control w-75 m-1 border border-primary dynamic-text"
          type="text"
          placeholder="Email"
          name="email"
          onChange={handleInputChange}
          defaultValue={form.email}
        />
        <input
          className="form-control w-75 m-1 border border-primary dynamic-text"
          type="password"
          placeholder="Password"
          onChange={handleInputChange}
          name="password"
          defaultValue={form.password}
        />

        {throwError(error)}

        <div className="d-flex flex-column justify-content-center align-items-center mt-2">
          <button
            className="btn btn-success w-50 m-1 dynamic-text"
            type="submit"
          >
            Submit
          </button>
          <button
            className="btn btn-primary m-1 dynamic-text"
            type="button"
            onClick={() => setlogin(!login)}
          >
            {login ? "Create Account" : "Log in instead"}
          </button>

          <h3 className="rounded w-25 text-center text-nowrap">-Or-</h3>
          <button
            className="btn btn-light dynamic-text m-1 bg-light bg-gradient border border-primary"
            type="button"
          >
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
