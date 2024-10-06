import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import signupGraphic from "../../assets/images/signup_graphic.png";
import { useToast } from "@chakra-ui/react";

const Signup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.data.accessToken);
        toast({
          title: "Signup successful!",
          description: "Redirecting to login...",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });

        // Wait for 3 seconds, then redirect to login page
        setTimeout(() => {
          navigate("/login");
        }, 3000); // 3 seconds delay before redirecting
      } else {
        toast({
          title: "Error",
          description: data.message,
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "bottom",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error during signup.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-form">
          <h1>Join Us</h1>
          <p>
            Create an account to get unlimited access to practice questions.
          </p>

          <form onSubmit={handleSignup}>
            <label htmlFor="username">Username*</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />

            <label htmlFor="email">Email address*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />

            <label htmlFor="password">Password*</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <label htmlFor="confirmPassword">Confirm Password*</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />

            <button type="submit" className="signup-button">
              Sign Up
            </button>
          </form>

          <p className="accountLogin">
            Have an account?{" "}
            <a href="/login" className="loginText">
              Log In
            </a>
          </p>
        </div>

        <div className="signup-graphic">
          <img src={signupGraphic} alt="Signup Graphic" />
          <p className="signup-graphic-text">
            You can practice anytime, anywhere, and in any situations!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
