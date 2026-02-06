import Auth from "../../utils/auth";
import anime from "animejs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { userContext } from "../../App";
import { createUser, loginUser, googleLogin } from "../../utils/API";
import {
  fireAuth,
  provider,
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
} from "../../utils/firebaseConfig";
import auth from "../../utils/auth";

export default function Login() {
  //add firebase signin with google
  const [login, setlogin] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const { setUser } = useContext(userContext);

  useEffect(() => {
    // handleRedirect();

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

  const authenticate = async (type) => {
    let data = null;
    if (type === "login") {
      form.email && form.password
        ? (data = await loginUser(form))
        : setError("Email and Password are required");
    } else if (type === "signup") {
      form.username && form.email && form.password
        ? (data = await createUser(form))
        : setError("One or more fields are missing a value");
    } else {
      throw new Error("Invalid authentication type");
    }

    handleAuthRequest(data);
  };

  const handleAuthRequest = (data) => {
    if (data) {
      const success = data.ok;
      if (data.status !== 500) {
        data.json().then((user) => {
          if (success) {
            // console.log("logging in");
            Auth.login(user.token);
            setUser(user.user);
            navigate("/", {
              replace: true,
            });
          } else {
            setError(user.message);
            document.querySelectorAll("input").forEach((input) => {
              input.value = "";
            });
          }
        });
      } else {
        setError(`${data.statusText}, Please try again later`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const btnDisable = (Boolean) => {
      document.querySelectorAll("button").forEach((btn) => {
        btn.disabled = Boolean;
      });
    };

    try {
      btnDisable(true);
      if (login) {
        authenticate("login");
      } else {
        authenticate("signup");
      }
    } catch (error) {
      throw new Error("Authentication error has occured");
    } finally {
      btnDisable(false);
    }
  };

  const handleGoogle = async () => {
    if (false) {
      fireAuth.useDeviceLanguage();
      console.log("Signing in with redirect");
      await signInWithRedirect(fireAuth, provider);
    } else {
      console.log("Signing in with popup");
      signInWithPopup(fireAuth, provider).then(async (user) => {
        // console.log("user: ", user);
        const { accessToken, displayName, email, uid } = user.user;
        const googleSignin = await googleLogin({
          idToken: accessToken,
          username: displayName,
          email: email,
          uid: uid,
        });

        handleAuthRequest(googleSignin);
      });
    }
  };

  // const handleRedirect = async () => {
  //   console.log("Checking Credential");
  //   const data = await getRedirectResult(fireAuth);
  //   console.log("Credential: ", data);
  // };

  const throwError = (error) => {
    return error !== "" ? (
      <div className="border border-danger rounded bg-light w-75 text-center">
        {error}
      </div>
    ) : null;
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <form
        className="form d-flex flex-column justify-content-center align-items-center p-5 rounded border border-black"
        id="loginForm"
        onSubmit={handleSubmit}
      >
        <header className="text-light w-100 d-flex m-1 flex-column align-items-center">
          <h2 className="title m-0">BALNCE</h2>
          <h5 className="subtitle">Track your spending</h5>
        </header>

        <br></br>

        {login ? (
          ""
        ) : (
          <input
            className="form-control bg-gradient w-75 m-2 p-2 dynamic-text"
            type="text"
            placeholder="username"
            onChange={handleInputChange}
            name="username"
            defaultValue={form.username}
          />
        )}
        <input
          className="form-control bg-gradient w-75 m-2 p-2 dynamic-text"
          type="text"
          placeholder="Email"
          name="email"
          onChange={handleInputChange}
          defaultValue={form.email}
        />
        <input
          className="form-control bg-gradient w-75 m-2 p-2 dynamic-text"
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

          <h3 className="rounded secondary-txt w-25 text-center text-nowrap">
            -Or-
          </h3>
          <button
            className="secondary-txt btn dynamic-text m-1 bg-gradient"
            type="button"
            onClick={handleGoogle}
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
