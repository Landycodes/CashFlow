import React, { useState, useEffect } from "react";
import Auth from "../utils/auth";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Breakdown from "./pages/Breakdown";
import Navbar from "./Navbar";

export default function Content() {
  const [currentPage, setPage] = useState("login");

  useEffect(() => {
    if (!Auth.loggedIn()) {
      console.log("not logged in");
      setPage("login");
    } else {
      console.log("logged in");
      setPage("home");
    }
  }, []);

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
      default:
      // page = <Home />;
    }
    return page;
  };

  const changePage = (page) => setPage(page);

  return currentPage === "login" ? (
    <Login changePage={changePage} />
  ) : (
    <div>
      <Navbar currentPage={currentPage} changePage={changePage} />
      {renderPage()}
    </div>
  );
}
