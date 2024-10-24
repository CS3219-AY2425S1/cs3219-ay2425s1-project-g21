import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDisclosure } from "@chakra-ui/react"; // Import useDisclosure for modal management
import MatchMe from "../../components/matchmaking/MatchMe";
import Countdown from "../../components/matchmaking/Countdown";
import MatchUnsuccess from "../../components/matchmaking/MatchUnsuccess";
import MatchSuccess from "../../components/matchmaking/MatchSuccess";
import AuthModal from "../../components/matchmaking/AuthModal"; // Import the modal component

const STAGE = {
  MATCHME: "matchme",
  COUNTDOWN: "countdown",
  SUCCESS: "success",
  UNSUCCESSFUL: "unsuccessful",
};

const MatchingPage: React.FC = () => {
  const [stage, setStage] = useState(STAGE.MATCHME);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure(); // Manage modal open/close

  // Handle modal actions
  const handleSignIn = () => {
    onClose(); // Close the modal
    navigate("/login"); // Redirect to sign-in page
  };

  const handleCancelAuth = () => {
    onClose(); // Close the modal
    navigate("/questions"); // Redirect to questions page
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        onOpen(); // Trigger the modal if 401 Unauthorized
        throw new Error(`Unauthorized (401): ${response.status}`);
      }
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  };

  const checkMatchStatus = async () => {
    try {
      const result = await fetchWithAuth("http://localhost:3002/match-status");
      const matchStatus = result.matchStatus;
      if (matchStatus == "isNotMatching") {
        setStage(STAGE.MATCHME);
      } else if (matchStatus == "isMatching") {
        setStage(STAGE.COUNTDOWN);
      } else if (matchStatus == "isMatched") {
        handleMatchFound();
      } else if (matchStatus == "unsuccessful") {
        handleMatchUnsuccess();
      }
    } catch {
      console.error("Failed to check match status.");
    }
  };

  const handleMatchMe = async () => {
    setStage(STAGE.COUNTDOWN);
    try {
      await fetchWithAuth("http://localhost:3002/find-match", {
        method: "POST",
        body: JSON.stringify({ topic: selectedTopic, difficulty: selectedDifficulty }),
      });
    } catch (error) {
      console.error("Failed to find match: ", error);
    }
  };

  const handleMatchFound = () => {
    setStage(STAGE.SUCCESS);
  };

  const handleMatchUnsuccess = () => {
    setStage(STAGE.UNSUCCESSFUL);
  };

  const handleRetry = async () => {
    try {
      await fetchWithAuth("http://localhost:3002/reset-status", { method: "POST" });
    } catch (error) {
      console.error("Failed to reset status: ", error);
    }
    setStage(STAGE.MATCHME);
  };

  const handleCancel = async () => {
    try {
      await fetchWithAuth("http://localhost:3002/cancel-matching", { method: "POST" });
    } catch (error) {
      console.error("Failed to cancel matching.");
    }
    setStage(STAGE.MATCHME);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    checkMatchStatus();
    const interval = setInterval(() => {
      checkMatchStatus();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {stage === STAGE.MATCHME && (
        <MatchMe
          onMatchMe={handleMatchMe}
          selectedTopic={selectedTopic}
          updateSelectedTopic={setSelectedTopic}
          selectedDifficulty={selectedDifficulty}
          updateSelectedDifficulty={setSelectedDifficulty}
        />
      )}

      {stage === STAGE.COUNTDOWN && (
        <Countdown
          onSuccess={handleMatchFound}
          onFailure={handleMatchUnsuccess}
          onCancel={handleCancel}
        />
      )}

      {stage === STAGE.UNSUCCESSFUL && (
        <MatchUnsuccess
          onRetry={handleRetry}
          onBackToDashboard={handleBackToDashboard}
        />
      )}

      {stage === STAGE.SUCCESS && <MatchSuccess />}

      {/* Modal for handling unauthorized access */}
      <AuthModal
        isOpen={isOpen}
        onClose={onClose}
        onSignIn={handleSignIn}
        onCancelAuth={handleCancelAuth}
      />
    </div>
  );
};

export default MatchingPage;
