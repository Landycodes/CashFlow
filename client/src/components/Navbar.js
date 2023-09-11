import React from "react";

export default function Navbar({ currentPage, changePage }) {
  return (
    <nav>
      <button onClick={() => changePage("login")}>Logout</button>
      <ul>
        <li onClick={() => changePage("home")}>Home</li>
        <li onClick={() => changePage("breakdown")}>breakdown</li>
      </ul>
    </nav>
  );
}
