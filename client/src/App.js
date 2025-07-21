import { createContext, useEffect, useState } from "react";
import "./App.css";
import { getMe } from "./utils/API";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import auth from "./utils/auth";
import Login from "./components/pages/Login";
import Navbar from "./components/Navbar";
import Home from "./components/pages/Home";
import Settings from "./components/pages/Settings";
import Loading from "./components/Loading";
import Expenses from "./components/pages/Expenses";
import Breakdown from "./components/pages/Breakdown";

export const userContext = createContext(null);

function AppRouter({
  user,
  setUser,
  loggedIn,
  setLoggedIn,
  checkProfileState,
}) {
  const location = useLocation();

  useEffect(() => {
    checkProfileState();
  }, [location]);

  const ProtectedRoutes = ({ loggedIn, children }) => {
    if (!loggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className="backgroundImage">
      {loggedIn && <Navbar />}
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoutes loggedIn={loggedIn}>
              <Home />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/login"
          element={loggedIn ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoutes loggedIn={loggedIn}>
              <Settings />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoutes loggedIn={loggedIn}>
              <Expenses />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/breakdown"
          element={
            <ProtectedRoutes loggedIn={loggedIn}>
              <Breakdown />
            </ProtectedRoutes>
          }
        />
        <Route path="*" element={<h1> Oopsie, We're Lost ;) </h1>} />
      </Routes>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(auth.loggedIn());

  const checkProfileState = async () => {
    setLoggedIn(auth.loggedIn());
    if (loggedIn && !user) {
      try {
        // console.log("getting user");
        const token = auth.getToken();
        const userData = await getMe(token);
        userData ? setUser(userData) : auth.logout();
      } catch (error) {
        console.error("Error creating user props", error);
      }
    }

    // console.log(location);
    // console.log(user);
    // console.log(loggedIn);
  };

  useEffect(() => {
    checkProfileState();
  }, []);

  return (
    <Router>
      {!user && loggedIn ? (
        <Loading />
      ) : (
        <userContext.Provider value={{ user, setUser }}>
          <AppRouter
            user={user}
            setUser={setUser}
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            checkProfileState={checkProfileState}
          />
        </userContext.Provider>
      )}
    </Router>
  );
}

export default App;
