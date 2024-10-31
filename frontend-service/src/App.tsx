import { Route, Routes, Navigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import "./App.css";
import QuestionPage from "./pages/QuestionPage";
import QuestionDetails from "../components/question/QuestionDetails";
import HomeNavBar from "../components/HomeNavBar";
import Login from "./pages/SignIn/login";
import Home from "./home";
import Signup from "./pages/SignUp/signup";
import MatchingPage from "./pages/MatchingPage";
import { useEffect, useState } from "react";
import CodeEditor from '../components/collab/CodeEditor';
import RoomPage from "./pages/RoomPage";
import AccountPage from "./pages/AccountPage";
import AboutUsPage from "./pages/AboutUsPage";
import ChangePassword from "../components/account/functions/ChangePassword"
import DeleteAccount from "../components/account/functions/DeleteAccount"

interface UserData {
  id: string
  username: string
  email: string
  isAdmin: boolean
}

function App() {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData|undefined>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3001/auth/verify-token", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message == "Token verified") {
            setIsAuthenticated(true);  // Token sent and verified.
            setUserData(data.data);
          } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);  // Token sent, but is invalid.
          }
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          localStorage.removeItem("token");
          setIsAuthenticated(false);  // Problem while trying to verify token.
      });
    } else {
      setIsAuthenticated(false);  // No token in localStorage found.
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUserData(undefined);
  };

  return (
    <Box className="app" fontFamily="Poppins, sans-serif">
      <HomeNavBar
        isAuthenticated={isAuthenticated}
        username={userData ? userData.username : ''}
        onLogout={handleLogout}
      />
      <Box pt="80px">
        <Routes>
          {/* Only allow login/signup routes if the user is not authenticated */}
          {!isAuthenticated ? (
            <>
              <Route
                path="/login"
                element={
                  <Login
                    updateAuthStatus={setIsAuthenticated}
                    updateUserData={setUserData}
                  />
                }
              />
              <Route path="/signup" element={<Signup />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} /> // Redirect authenticated users
          )}

          {/* Public routes */}
          <Route path="/" element={<QuestionPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/questions" element={<QuestionPage />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route path="/aboutus" element={<AboutUsPage />} />

          {isAuthenticated ? (
            <>
            <Route path="/match-me" element={<MatchingPage />} />
            <Route path="/editor" element={<CodeEditor />} />
            <Route path="/room" element={<RoomPage />} />

            <Route path="/account" element={ <AccountPage
                username={userData ? userData.username : ''}
                id={userData ? userData.id: ''}
                email={userData ? userData.email : ''} />}>
                <Route path="password" element={<ChangePassword userId={userData?.id} />}/>
                <Route path="delete" element={<DeleteAccount userId={userData?.id} onLogout={handleLogout}/>} />
            </Route>
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} /> // Redirect authenticated users
          )}


        </Routes>
      </Box>
    </Box>
  );
}

export default App;
