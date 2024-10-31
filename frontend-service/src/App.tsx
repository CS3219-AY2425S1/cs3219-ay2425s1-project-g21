import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import "./App.css";
import QuestionPage from "./pages/QuestionPage";
import QuestionDetails from "../components/question/QuestionDetails";
import HomeNavBar from "../components/HomeNavBar";
import Login from "./pages/SignIn/login";
import Home from "./home";
import Signup from "./pages/SignUp/signup";
import MatchingPage from "./pages/MatchingPage";
import { SetStateAction, useEffect, useState } from "react";
import CodeEditor from '../components/collab/CodeEditor';
import RoomPage from "./pages/RoomPage";
import ProfilePage from "./pages/ProfilePage";
import AboutUs from "./pages/AboutUsPage";
import ChangePasswordPage from "./pages/ChangePassword";
import AboutUsPage from "./pages/AboutUsPage";
import QuestionSideBar from '../components/collab/QuestionSideBar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("email")
    setIsAuthenticated(false)
    navigate("/login")
  }

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
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
          }
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <Box className="app" fontFamily="Poppins, sans-serif">
      <HomeNavBar isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Box pt="80px">
        <Routes>
          {/* Only allow login/signup routes if the user is not authenticated */}
          {!isAuthenticated ? (
            <>
              <Route path="/login" element={<Login updateAuthStatus={setIsAuthenticated} />} />
              <Route path="/aboutus" element={<AboutUs />} />
              <Route path="/signup" element={<Signup updateAuthStatus={function (value: SetStateAction<boolean>): void {
                throw new Error("Function not implemented.");
              }} />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} /> // Redirect authenticated users
          )}

          {/* Public or authenticated routes */}
          <Route path="/" element={<QuestionPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/questions" element={<QuestionPage />} />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route path="/match-me" element={<MatchingPage />} />
          <Route path="/editor" element={<CodeEditor roomId={"3dd0abb8-4c7c-42c2-8d44-96858f5170ac"} userId={"671ff3dce550f80f118be8cb"} />} />
          <Route path="/room" element={<RoomPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/aboutus" element={<AboutUsPage />} />
          <Route path="/changepassword" element={<ChangePasswordPage />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
