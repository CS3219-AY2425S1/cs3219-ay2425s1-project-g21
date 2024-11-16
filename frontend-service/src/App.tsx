import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { Box, Spinner } from "@chakra-ui/react";
import axios from "axios";
import { fetchWithAuth } from "./utils/fetchWithAuth";
import "./App.css";
import QuestionPage from "./pages/QuestionPage";
import QuestionDetails from "../components/question/QuestionDetails";
import HomeNavBar from "../components/HomeNavBar";
import Login from "./pages/SignIn/login";
import Home from "./home";
import Signup from "./pages/SignUp/signup";
import MatchingPage from "./pages/MatchingPage";
import Chat from "../components/chat/ChatComponent";
import { useEffect, useState } from "react";
import CodeEditor from "../components/collab/CodeEditor";
import RoomPage from "./pages/Room/RoomPage";
import OldRoomPage from "./pages/Room/OldRoomPage";
import AccountPage from "./pages/AccountPage";
import AboutUsPage from "./pages/AboutUsPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChangePassword from "../components/account/functions/ChangePassword";
import ChangePasswordModal from "../components/account/functions/ChangePasswordModal";
import DeleteAccount from "../components/account/functions/DeleteAccount";
import HomePage from "../components/history/HomePage";
interface UserData {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  mustUpdatePassword: boolean;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [userData, setUserData] = useState<UserData | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [userActivity, setUserActivity] = useState<"room" | "matching" | null>(null);

  const updateAuthStatus = (authStatus: boolean, isAdminStatus = false) => {
    setIsAuthenticated(authStatus);
    setUserIsAdmin(isAdminStatus);
  };
  const [userId, setUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${import.meta.env.VITE_USER_SERVICE_API_URL}/auth/verify-token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Token verified") {
            setIsAuthenticated(true);
            setUserIsAdmin(data.data.isAdmin);
            setUserData(data.data);
            if (data.data.mustUpdatePassword) {
              setIsChangePasswordModalOpen(true);
            }
            setUserId(data.data.id);
          } else {
            localStorage.removeItem("token");
            setIsAuthenticated(false);
            setUserIsAdmin(false);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error verifying token:", error);
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUserIsAdmin(false);
          setLoading(false);
        });
    } else {
      setIsAuthenticated(false);
      setUserIsAdmin(false);
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (data: UserData) => {
    setIsAuthenticated(true);
    setUserData(data);
    if (data.mustUpdatePassword) {
      setIsChangePasswordModalOpen(true);
    }
  };

  const handleLogout = async () => {
    try {
      if (userActivity === "room") {
        await handleLeaveRoom();
      } else if (userActivity === "matching") {
        await handleCancelMatching();
      }

      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUserData(undefined);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleCancelMatching = async () => {
    try {
      const token = localStorage.getItem("token");
  
      if (!token) {
        navigate("/login");
        return;
      }
  
      await fetch(`${import.meta.env.VITE_REQUEST_SERVICE_API_URL}/cancel-matching`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      console.log("Matching cancelled successfully.");
    } catch (error) {
      console.error("Error cancelling matching:", error);
    }
  };

  const handleLeaveRoom = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
  
      if (!userId || !token) {
        navigate("/login");
        return;
      }
  
      const response = await axios.post(
        `${import.meta.env.VITE_COLLABORATION_SERVICE_API_URL}/room/leaveRoom`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchWithAuth(
        `${import.meta.env.VITE_REQUEST_SERVICE_API_URL}/reset-status`,
        {
          method: "POST",
        }
      );
  
      console.log(response.data.message || "You have left the room.");
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handlePasswordChanged = () => {
    setIsChangePasswordModalOpen(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box className="app" fontFamily="Poppins, sans-serif">
      <HomeNavBar
        isAuthenticated={isAuthenticated}
        username={userData ? userData.username : ""}
        onLogout={handleLogout}
        // TODO: Logging out here should trigger leave room event if in room, and cancel matching event if in queue.
      />
      <Box pt="80px">
        <Routes>
          {/* Unauthenticated routes */}
          {!isAuthenticated ? (
            <>
              <Route
                path="/login"
                element={
                  <Login
                    onLogin={handleLoginSuccess}
                    updateAuthStatus={updateAuthStatus}
                  />
                }
              />
              <Route path="/signup" element={<Signup />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/" replace />} /> // Redirect authenticated users
          )}

          {/* Public routes */}
          <Route path="/home" element={<Home />} />
          <Route
            path="/questions"
            element={<QuestionPage userIsAdmin={userIsAdmin} />}
          />
          <Route path="/questions/:id" element={<QuestionDetails />} />
          <Route path="/aboutus" element={<AboutUsPage />} />
          <Route path="/forgot-password" element={<ResetPasswordPage />} />

          {/* Authenticated routes */}
          {isAuthenticated ? (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/match-me" element={<MatchingPage setUserActivity={setUserActivity} />} />
              <Route path="/editor" element={<CodeEditor />} /> {/* TODO: Should this be a route? */}
              <Route
                path="/room"
                element={<RoomPage userId={userData?.id} setUserActivity={setUserActivity} />}
              />
              <Route
                path="/room/:roomId"
                element={<OldRoomPage userId={userData?.id} />}
              />
              <Route
                path="/account"
                element={
                  <AccountPage
                    username={userData ? userData.username : ""}
                    id={userData ? userData.id : ""}
                    email={userData ? userData.email : ""}
                  />
                }
              >
                <Route
                  path="password"
                  element={<ChangePassword userId={userData?.id} />}
                />
                <Route
                  path="delete"
                  element={
                    <DeleteAccount
                      userId={userData?.id}
                      onLogout={handleLogout}
                    />
                  }
                />
              </Route>
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} /> // Redirect authenticated users
          )}

          <Route path="/chat" element={<Chat userId={userId || ""} />} />
        </Routes>
      </Box>
      {/* Render the Update Password Modal if required */}
      {userData?.mustUpdatePassword && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          userId={userData.id}
          onPasswordUpdated={handlePasswordChanged}
        />
      )}
    </Box>
  );
}

export default App;
