import React, { useState, useEffect } from "react";
import Auth from "../utils/auth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Breakdown from "./pages/Breakdown";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import Navbar from "./Navbar";
import { getMe } from "../utils/API";

export default function Content() {
  const [currentPage, setPage] = useState("login");
  const [user, setUser] = useState({});
  const userProfileLoaded = Object.keys(user).length !== 0;

  useEffect(() => {
    if (!Auth.loggedIn()) {
      setUser({});
      setPage("login");
      return;
    }
    if (currentPage === "login") {
      setPage("home");
    } else if (!userProfileLoaded) {
      getUserInfo();
    }
  }, [currentPage]);

  const getUserInfo = () => {
    try {
      if (Object.keys(user).length === 0) {
        const token = Auth.getToken();
        getMe(token).then((userData) => {
          // console.log(userData);
          setUser({ ...userData });
        });
      }
    } catch (error) {
      console.error("Error creating user props", error);
    }
  };

  const renderPage = (user) => {
    let page;
    switch (currentPage) {
      case "login":
        page = <Login />;
        break;
      case "home":
        page = <Home user={user} />;
        break;
      case "breakdown":
        page = <Breakdown user={user} />;
        break;

      case "add":
        page = <Expenses user={user} />;
        break;
      case "settings":
        page = <Settings user={user} />;
        break;
      default:
    }
    return page;
  };

  const changePage = (page) => setPage(page);

  return currentPage === "login" ? (
    <Login changePage={changePage} />
  ) : (
    <div>
      <Navbar currentPage={currentPage} changePage={changePage} />
      {userProfileLoaded ? renderPage(user) : <h1>Loading...</h1>}
    </div>
  );
}
