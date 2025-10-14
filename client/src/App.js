import { createContext, useEffect, useState } from "react";
import "./App.css";
import { fetchAccountData, getMe } from "./utils/API";
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
import Settings from "./components/pages/Settings";
import Loading from "./components/Loading";
import Expenses from "./components/pages/Expenses";
import Transactions from "./components/pages/Transactions";
import Footer from "./components/Footer";
import Dashboard from "./components/pages/Dashboard";

export const userContext = createContext();

function AppRouter({
  user,
  setUser,
  loggedIn,
  setLoggedIn,
  checkProfileState,
  token,
}) {
  const location = useLocation();

  useEffect(() => {
    setLoggedIn(auth.loggedIn());
  }, [location.pathname]);

  const ProtectedRoutes = ({ loggedIn, children }) => {
    if (!loggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  const PlaidProtectedRoute = ({ children }) => {
    if (!user?.plaidAccessToken) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <div className="backgroundImage d-flex flex-column min-vh-100">
      {loggedIn && <Navbar />}
      <main className="flex-grow-1">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoutes loggedIn={loggedIn}>
                <Dashboard token={token} />
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
                <Settings token={token} />
              </ProtectedRoutes>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoutes loggedIn={loggedIn}>
                <PlaidProtectedRoute>
                  <Expenses />
                </PlaidProtectedRoute>
              </ProtectedRoutes>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoutes loggedIn={loggedIn}>
                <PlaidProtectedRoute>
                  <Transactions />
                </PlaidProtectedRoute>
              </ProtectedRoutes>
            }
          />
          <Route path="*" element={<h1> Oopsie, We're Lost ;) </h1>} />
        </Routes>
      </main>
      {loggedIn && <Footer />}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(undefined);
  const [loggedIn, setLoggedIn] = useState(auth.loggedIn());
  const [token, setToken] = useState(auth.getToken());

  const checkProfileState = async () => {
    // console.log("profile check running");
    setToken(auth.getToken());
    setLoggedIn(auth.loggedIn());
    if (loggedIn) {
      try {
        // const token = auth.getToken();
        const userData = await getMe(token);
        userData ? setUser(userData) : auth.logout();

        if (userData?.plaidAccessToken) {
          await fetchAccountData(token);
        }
      } catch (error) {
        console.error("Error creating user props", error);
      }
    }
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
            token={token}
          />
        </userContext.Provider>
      )}
    </Router>
  );
}

export default App;
