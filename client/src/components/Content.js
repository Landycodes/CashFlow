import React, { useState, useEffect, createContext } from "react";
import Auth from "../utils/auth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Breakdown from "./pages/Breakdown";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import Navbar from "./Navbar";
import { getMe } from "../utils/API";

export const userContext = createContext(null);

export default function Content() {
  const [currentPage, setPage] = useState("login");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!Auth.loggedIn()) {
      setUser(null);
      setPage("login");
      return;
    }
    if (currentPage === "login") {
      setPage("home");
    } else if (!user) {
      getUserInfo();
    }
  }, [currentPage]);

  const getUserInfo = () => {
    try {
      if (!user) {
        const token = Auth.getToken();
        getMe(token).then((userData) =>
          userData ? setUser(userData) : Auth.logout()
        );
      }
    } catch (error) {
      console.error("Error creating user props", error);
    }
  };

  const renderPage = () => {
    let page;
    switch (currentPage) {
      case "login":
        page = <Login />;
        break;
      case "home":
        page = <Home />;
        break;
      case "breakdown":
        page = <Breakdown />;
        break;

      case "add":
        page = <Expenses />;
        break;
      case "settings":
        page = <Settings />;
        break;
      default:
    }
    return page;
  };

  const changePage = (page) => setPage(page);

  return currentPage === "login" ? (
    <Login changePage={changePage} />
  ) : user ? (
    <userContext.Provider value={user}>
      <Navbar currentPage={currentPage} changePage={changePage} />
      {renderPage()}
    </userContext.Provider>
  ) : (
    <h1>Loading...</h1>
  );
}
