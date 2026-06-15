import { useState } from "react";

export default function MobileNav({ setUser, style, navigate, Auth }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNav = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <span className={`${style.mobileNav}`}>
      <button
        className={style.hamburger}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Toggle menu"
      >
        <span className={`${style.bar} ${menuOpen ? style.barTop : ""}`} />
        <span className={`${style.bar} ${menuOpen ? style.barMid : ""}`} />
        <span className={`${style.bar} ${menuOpen ? style.barBot : ""}`} />
      </button>

      {menuOpen && (
        <div
          className={`${style.dropdownMenu} window-style-dark position-absolute`}
        >
          <h6 className="py-5"> </h6>
          <hr className={style.divider}></hr>
          <h6
            className={`${style.menuBtn} rounded p-3`}
            onClick={() => handleNav("/")}
          >
            Dashboard
          </h6>
          <hr className={style.divider}></hr>

          <h6
            className={`${style.menuBtn} rounded p-3`}
            onClick={() => handleNav("/Transactions")}
          >
            Transactions
          </h6>
          <hr className={style.divider}></hr>
          <h6
            className={`${style.menuBtn} rounded p-3`}
            onClick={() => handleNav("/expenses")}
          >
            Expenses
          </h6>
          <hr className={style.divider}></hr>

          <h6
            className={`${style.menuBtn} rounded p-3`}
            onClick={() => handleNav("/settings")}
          >
            Settings
          </h6>
          <hr className={style.divider}></hr>

          <h6
            className={`${style.menuBtn} ${style.logOut} rounded p-3`}
            onClick={() => {
              Auth.logout();
              setUser(null);
            }}
          >
            Logout
          </h6>
        </div>
      )}
    </span>
  );
}
