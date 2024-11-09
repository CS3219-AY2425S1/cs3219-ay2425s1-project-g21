import React, { useEffect, useRef, useState } from "react";
import MonacoEditor, { OnMount } from "@monaco-editor/react";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Select,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { FIREBASE_DB } from "../../FirebaseConfig";
import { ref, onValue, set, get } from "firebase/database";
import axios from "axios";
import QuestionSideBar from "./QuestionSidebar";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth } from "../../src/utils/fetchWithAuth";
import { shikiToMonaco } from "@shikijs/monaco";
import { createHighlighter } from "shiki";
import * as monaco from "monaco-editor";

const languageType: { [key: string]: string } = {
  javascript: "// Start writing your JavaScript code here...",
  python: "# Start writing your Python code here...",
  java: "// Start writing your Java code here...",
  csharp: "// Start writing your C# code here...",
};

interface CodeEditorProps {
  roomId: string;
  thisUserId: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ roomId, thisUserId }) => {
  const [code, setCode] = useState("//Start writing your code here..");
  const [codeLanguage, setCodeLanguage] = useState<string>("javascript");
  const [leaveRoomMessage, setLeaveRoomMessage] = useState<string | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // New state
  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "typing" | null
  >(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  const toast = useToast(); // Initialize Chakra UI toast
  const previousUsersCount = useRef<number>(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [assignedQuestionId, setAssignedQuestionId] = useState<number | null>(
    null
  );

  const usersRef = ref(FIREBASE_DB, `rooms/${roomId}/users`);
  const codeRef = ref(FIREBASE_DB, `rooms/${roomId}/code`);
  const languageRef = ref(FIREBASE_DB, `rooms/${roomId}/currentLanguage`);

  const cancelRef = useRef(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );
  const navigate = useNavigate();

  // create a use effect for fetching of question id assigned to users in the room
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get("http://localhost:5001/room/data", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const assignedQuestionId = response.data.selectedQuestionId;
        console.log("Fetched room data:", response.data);
        console.log("Selected Question ID from room data:", assignedQuestionId);

        if (assignedQuestionId) {
          setAssignedQuestionId(assignedQuestionId);
          fetchAssignedQn(assignedQuestionId);
        } else {
          console.error("No selectedQuestionId found in room data");
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      }
    };

    const fetchAssignedQn = async (questionId: number) => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/questions/${questionId}`
        );
        console.log("Fetched question details:", response.data);
        setQuestion(response.data);
      } catch (error) {
        console.error("Failed to fetch question details:", error);
      }
    };

    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    const setupSyntaxHighlighting = async () => {
      const highlighter = await createHighlighter({
        themes: ["github-dark", "material-theme-darker", "everforest-dark"],
        langs: ["javascript", "python", "java", "csharp"],
      });
      shikiToMonaco(highlighter, monaco);
      monaco.languages.register({ id: "javascript" });
      monaco.languages.register({ id: "python" });
      monaco.languages.register({ id: "java" });
      monaco.languages.register({ id: "csharp" });
    };
    setupSyntaxHighlighting().catch(console.error);
  }, []);

  useEffect(() => {
    const unsubscribe = onValue(codeRef, (snapshot) => {
      const updatedCode = snapshot.val();
      if (updatedCode !== null && updatedCode !== code) {
        setCode(updatedCode);
        if (updatedCode !== null && updatedCode[codeLanguage]) {
          setCode(updatedCode[codeLanguage]);
        } else {
          setCode(languageType[codeLanguage]); // Set to default if no snippet is saved
        }
      }
    });
    const unsubscribeLanguage = onValue(languageRef, (snapshot) => {
      const savedLanguage = snapshot.val();
      if (savedLanguage) {
        setCodeLanguage(savedLanguage);
      }
    });
    return () => {
      unsubscribe();
      unsubscribeLanguage();
    };
  }, [code, codeLanguage]);

  useEffect(() => {
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = snapshot.val();

      // Count only users with a true status, excluding the current user
      const activeUsers = users
        ? Object.entries(users).filter(
            ([userId, status]) => status === true && userId !== thisUserId
          )
        : [];
      const userCount = activeUsers.length;

      // Update the active user count
      setActiveUserCount(userCount);

      // Update isReadOnly based on the presence of other users
      setIsReadOnly(userCount === 0);

      // Check if the count decreased, meaning a user other than the current user has left
      if (userCount < previousUsersCount.current) {
        toast({
          title: "Partner left the room",
          description:
            "The other user has left the room. The editor is now read-only.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }

      // Update the previous user count to the current count
      previousUsersCount.current = userCount;
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);

  useEffect(() => {
    // Listen to Firebase database changes to confirm save status
    const unsubscribe = onValue(codeRef, (snapshot) => {
      const savedCode = snapshot.val();
      if (savedCode === code) {
        setSaveStatus("saved");
        setLastSavedTime(new Date());
      }
    });

    return () => unsubscribe();
  }, [code, codeLanguage, codeRef]);

  const handleEditorChange = async (newValue: string | undefined) => {
    if (newValue !== undefined) {
      setCode(newValue);
      setSaveStatus("saving");
      await set(
        ref(FIREBASE_DB, `rooms/${roomId}/code/${codeLanguage}`),
        newValue
      );
      setSaveStatus("saved");
      setLastSavedTime(new Date());
    }
  };

  const formatTimeSinceLastSave = () => {
    if (!lastSavedTime) return "";
    const seconds = Math.floor(
      (new Date().getTime() - lastSavedTime.getTime()) / 1000
    );
    return `Last saved ${seconds} seconds ago`;
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

      setLeaveRoomMessage(response.data.message || "You have left the room.");
      await fetchWithAuth("http://localhost:3002/reset-status", {
        method: "POST",
      });

      setIsRedirecting(true); // Show redirecting modal

      setTimeout(() => {
        navigate("/match-room");
      }, 2000);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handleConfirmLeave = () => {
    setIsDialogOpen(false);
    handleLeaveRoom();
  };

  const handleResetCode = () => {
    const defaultCode = languageType[codeLanguage];
    setCode(defaultCode);
    set(ref(FIREBASE_DB, `rooms/${roomId}/code/${codeLanguage}`), defaultCode);
  };

  const handleLanguageChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedLanguage = event.target.value;
    await set(ref(FIREBASE_DB, `rooms/${roomId}/code/${codeLanguage}`), code);
    await set(languageRef, selectedLanguage);
    setCodeLanguage(selectedLanguage);

    const codeSnippetsSnapshot = await get(codeRef);
    const codeSnippets = codeSnippetsSnapshot.val();
    if (codeSnippets && codeSnippets[selectedLanguage]) {
      setCode(codeSnippets[selectedLanguage]);
    } else {
      // If no code snippet exists for this language, use default
      const defaultCode =
        languageType[selectedLanguage] || "// Start writing your code here...";
      setCode(defaultCode);
      // Save the default code snippet to Firebase
      await set(
        ref(FIREBASE_DB, `rooms/${roomId}/code/${selectedLanguage}`),
        defaultCode
      );
    }

    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      monaco.editor.setModelLanguage(model, selectedLanguage);
      monacoEditorRef.current.layout();
    }
  };

  const handleEditorDidMount: OnMount = (editor) => {
    monacoEditorRef.current = editor;
    editor.layout();
  };

  return (
    <Box display="flex" height="100vh">
      <Box width="500px" flexShrink={0} borderRight="1px solid #e2e8f0">
        <Box
          mt={4}
          p={2}
          border="1px solid #e2e8f0"
          borderRadius="md"
          bg={activeUserCount > 0 ? "green.100" : "orange.100"}
        >
          <Text
            fontSize="md"
            color={activeUserCount > 0 ? "green.700" : "orange.700"}
          >
            {activeUserCount > 0 ? (
              "Your partner is in the room."
            ) : (
              <>
                You are the only user in the room. <br />
                <Text as="span" fontWeight="bold">
                  The editor is now read-only.
                </Text>
              </>
            )}
          </Text>
        </Box>
        {/* display question details of assigned question */}
        {assignedQuestionId ? (
          <QuestionSideBar
            assignedQuestionId={assignedQuestionId.toString()}
            userId={thisUserId}
            roomId={roomId}
            isOld={false}
          />
        ) : (
          <Text color="red.500">Loading question...</Text>
        )}
      </Box>
      <Box
        flex="1"
        maxWidth="900px"
        margin="auto"
        mt={4}
        p={4}
        borderRadius="8px"
        border="1px solid #e2e8f0"
        bg="gray.50"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={3}
          p={2}
          borderBottom="1px solid #e2e8f0"
        >
          <Text fontSize="lg" fontWeight="bold" color="gray.700">
            Code Editor
          </Text>
          <Box display="flex" alignItems="center">
            <Box display="flex" alignItems="center">
              {saveStatus === "saved" && (
                <Text color="green.500" fontSize="sm">
                  Saved
                </Text>
              )}
              {saveStatus === "saving" && (
                <Text color="orange.500" fontSize="sm">
                  Saving...
                </Text>
              )}
              {saveStatus === "typing" && (
                <Text color="gray.500" fontSize="sm">
                  {formatTimeSinceLastSave()}
                </Text>
              )}
            </Box>
            <Select
              size="sm"
              width="150px"
              mr={3}
              value={codeLanguage}
              onChange={handleLanguageChange}
            >
              {Object.keys(languageType).map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </Select>
            <Button
              size="sm"
              colorScheme="red"
              mr={3}
              onClick={() => setIsDialogOpen(true)}
            >
              Leave Room
            </Button>
            <Button size="sm" colorScheme="gray" onClick={handleResetCode}>
              Reset
            </Button>
          </Box>
        </Box>

        <Box height="80vh" borderRadius="8px" width="100%" overflow="hidden">
          <MonacoEditor
            height="100%"
            language={codeLanguage}
            theme="vs-light"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 16,
              fontFamily: "'Fira Code', monospace",
              minimap: { enabled: false },
              lineNumbers: "on",
              readOnly: isReadOnly,
            }}
          />
        </Box>

        {leaveRoomMessage && (
          <Text color="red.500" mt={4}>
            {leaveRoomMessage}
          </Text>
        )}

        <AlertDialog
          isOpen={isDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsDialogOpen(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Leave Room
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to leave the room?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsDialogOpen(false)}>
                  No
                </Button>
                <Button colorScheme="red" onClick={handleConfirmLeave} ml={3}>
                  Yes, Leave
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>

        {/* Redirecting Modal */}
        <AlertDialog
          isOpen={isRedirecting}
          leastDestructiveRef={cancelRef}
          closeOnOverlayClick={false}
          onClose={() => setIsRedirecting(false)}
        >
          <AlertDialogOverlay>
            <AlertDialogContent textAlign="center" py={6} px={4} maxW="sm">
              <AlertDialogHeader
                fontSize="lg"
                fontWeight="bold"
                color="teal.600"
              >
                Leaving Room
              </AlertDialogHeader>
              <AlertDialogBody
                display="flex"
                flexDirection="column"
                alignItems="center"
              >
                <Text fontSize="md" color="gray.700" mb={4}>
                  You are leaving the room and will be redirected shortly.
                </Text>
                <Spinner size="lg" color="teal.500" />
              </AlertDialogBody>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Box>
  );
};

export default CodeEditor;
