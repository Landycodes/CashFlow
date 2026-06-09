export default function DesktopNav({ setUser, style, navigate, Auth }) {
  return (
    <span className={`${style.desktopNav} mx-2`}>
      <h6
        className={`${style.menuBtn} rounded p-3 pt-3`}
        onClick={() => navigate("/expenses")}
      >
        Expenses
      </h6>
      <h6
        className={`${style.menuBtn} rounded p-3 pt-3`}
        onClick={() => navigate("/Transactions")}
      >
        Transactions
      </h6>
      <h6
        className={`${style.menuBtn} rounded p-3 pt-3`}
        onClick={() => navigate("/")}
      >
        Dashboard
      </h6>
      <h6
        className={`${style.menuBtn} rounded p-3 pt-3`}
        onClick={() => {
          navigate("/settings");
        }}
      >
        Settings
      </h6>
      <h6
        className={`${style.menuBtn} ${style.logOut} log-out rounded p-3 pt-3`}
        onClick={() => {
          Auth.logout();
          setUser(null);
        }}
      >
        Logout
      </h6>
    </span>
  );
}
