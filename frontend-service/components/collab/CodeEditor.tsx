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
import { ref, onValue, set, get, child } from "firebase/database";
import axios from "axios";
import QuestionSideBar from "./QuestionSideBar";
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
  // Code editor states
  const [code, setCode] = useState("//Start writing your code here..");
  const [codeLanguage, setCodeLanguage] = useState<string>("javascript");

  const [pendingCodeLanguage, setPendingCodeLanguage] = useState<string | null>(
    null
  );
  const [question, setQuestion] = useState<Question | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [saveStatus, setSaveStatus] = useState<
    "saved" | "saving" | "typing" | null
  >(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [pendingChangeRequest, setPendingChangeRequest] = useState(false);
  // const [question, setQuestion] = useState<Question | null>(null);

  // Room states
  const [leaveRoomMessage, setLeaveRoomMessage] = useState<string | null>(null);
  const [isLeaveRoomDialogOpen, setIsLeaveRoomDialogOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [roomCreatedAt, setRoomCreatedAt] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<string>("0s");

  const previousUsersCount = useRef<number>(0);
  const [activeUserCount, setActiveUserCount] = useState(0);
  const [assignedQuestionId, setAssignedQuestionId] = useState<number | null>(
    null
  );

  // Firebase references
  const usersRef = ref(FIREBASE_DB, `rooms/${roomId}/users`);
  const codeRef = ref(FIREBASE_DB, `rooms/${roomId}/code`);

  const userLanguagesRef = ref(FIREBASE_DB, `rooms/${roomId}/userLanguages`);
  const languageChangeRequestRef = ref(
    FIREBASE_DB,
    `rooms/${roomId}/languageChangeRequest`
  );

  const languageRef = ref(FIREBASE_DB, `rooms/${roomId}/currentLanguage`);

  const cancelRef = useRef(null);
  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(
    null
  );

  const toast = useToast();
  const navigate = useNavigate();

  // create a use effect for fetching of question id assigned to users in the room
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_COLLABORATION_SERVICE_API_URL}/room/data`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const assignedQuestionId = response.data.selectedQuestionId;
        const roomCreatedAtString = response.data.createdAt; // String format: '09-11-2024, 09:24:51 UTC'
        if (roomCreatedAtString) {
          const createdAtDate = new Date(Date.parse(roomCreatedAtString));
          console.log("Room created at:", createdAtDate);
          setRoomCreatedAt(createdAtDate);
        }
        console.log("Fetched room data:", response.data);
        console.log("Selected Question ID from room data:", assignedQuestionId);

        if (assignedQuestionId) {
          setAssignedQuestionId(assignedQuestionId);
          // fetchAssignedQn(assignedQuestionId);
        } else {
          console.error("No selectedQuestionId found in room data");
        }
      } catch (error) {
        console.error("Failed to fetch room data:", error);
      }
    };

    // const fetchAssignedQn = async (questionId: number) => {
    //   try {
    //     const response = await axios.get(`${
    //   import.meta.env.VITE_QUESTION_SERVICE_API_URL
    // }/api/questions/${questionId}`)
    //     console.log("Fetched question details:", response.data)
    //     // setQuestion(response.data)
    //   } catch (error) {
    //     console.error("Failed to fetch question details:", error)
    //   }
    // }

    fetchRoomData();
  }, [roomId]);

  // Setup syntax highlighting
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
    const loadUserLanguage = async () => {
      const userLanguageSnapshot = await get(
        child(userLanguagesRef, thisUserId)
      ); // userLang references userID with language
      const userLanguage = userLanguageSnapshot.val() || "javascript"; // default lang set as javascript
      setCodeLanguage(userLanguage);

      // load code snippet
      const codeSnippetSnapshot = await get(codeRef);
      const codeSnippets = codeSnippetSnapshot.val();
      if (codeSnippets && codeSnippets[userLanguage]) {
        setCode(codeSnippets[userLanguage]);
      } else {
        const placeholderCode = languageType[userLanguage];
        setCode(placeholderCode);
        await set(
          ref(FIREBASE_DB, `rooms/${roomId}/code/${userLanguage}`),
          placeholderCode
        );
      }
    };
    loadUserLanguage();
  }, [thisUserId, roomId]);

  // Actions based on whether the other user is present
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

  // Show save state of the code
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
  }, [code, userLanguagesRef, codeRef]);

  // listen for code changes within current language
  useEffect(() => {
    const codeLanguageRef = ref(
      FIREBASE_DB,
      `rooms/${roomId}/code/${codeLanguage}`
    );
    const unsubscribe = onValue(codeLanguageRef, (snapshot) => {
      const updatedCode = snapshot.val();
      if (updatedCode !== null && updatedCode !== code) {
        setCode(updatedCode);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [codeLanguage, code, roomId]);

  // Handle code changes
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

  // listen for changes from other users
  useEffect(() => {
    const unsubscribe = onValue(languageChangeRequestRef, (snapshot) => {
      const req = snapshot.val();
      if (
        req &&
        req.requestedBy !== thisUserId &&
        req.newLanguage !== codeLanguage
      ) {
        setPendingCodeLanguage(req.newLanguage);
        showLanguageChangeToast(req.newLanguage);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [thisUserId, codeLanguage, toast]);

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
      await fetchWithAuth(
        `${import.meta.env.VITE_REQUEST_SERVICE_API_URL}/reset-status`,
        {
          method: "POST",
        }
      );

      setIsRedirecting(true); // Show redirecting modal

      setTimeout(() => {
        navigate("/match-room");
      }, 2000);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const handleConfirmLeave = () => {
    setIsLeaveRoomDialogOpen(false);
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
    await set(child(userLanguagesRef, thisUserId), selectedLanguage);
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

    await set(languageChangeRequestRef, {
      requestedBy: thisUserId,
      newLanguage: selectedLanguage,
      timestamp: Date.now(),
    });
  };

  const showLanguageChangeToast = (newLanguage: string) => {
    if (!newLanguage || pendingChangeRequest) return;
    setPendingChangeRequest(true);

    toast({
      position: "top",
      duration: null,
      isClosable: true,
      render: ({ onClose }) => (
        <Box m={3} color="white" p={3} bg="blue.500" borderRadius="md">
          <Text fontSize="sm">
            Your partner wants to change the language to <b>{newLanguage}</b>.
            Do you accept?
          </Text>
          <Button
            colorScheme="green"
            size="sm"
            mr={2}
            onClick={() => {
              confirmLanguageChange(newLanguage);
              setPendingChangeRequest(false);
              onClose();
            }}
          >
            Yes
          </Button>
          <Button
            colorScheme="red"
            size="sm"
            onClick={() => {
              declineLanguageChange();
              setPendingChangeRequest(false);
              onClose();
            }}
          >
            No
          </Button>
        </Box>
      ),
    });
  };

  const confirmLanguageChange = async (newLanguage: string) => {
    await set(ref(FIREBASE_DB, `rooms/${roomId}/code/${codeLanguage}`), code);

    await set(child(userLanguagesRef, thisUserId), newLanguage);
    setCodeLanguage(newLanguage);

    const codeSnippetsSnapshot = await get(codeRef);
    const codeSnippets = codeSnippetsSnapshot.val();

    if (codeSnippets && codeSnippets[newLanguage]) {
      setCode(codeSnippets[newLanguage]);
    } else {
      const defaultCode =
        languageType[newLanguage] || "// Start writing your code here...";
      setCode(defaultCode);
      await set(
        ref(FIREBASE_DB, `rooms/${roomId}/code/${newLanguage}`),
        defaultCode
      );
    }

    if (monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, newLanguage);
        monacoEditorRef.current.layout();
      }
    }
    await set(languageChangeRequestRef, {
      requestedBy: thisUserId,
      newLanguage,
      response: "accepted",
      timestamp: Date.now(),
    });
  };

  const declineLanguageChange = () => {};

  const handleEditorDidMount: OnMount = (editor) => {
    monacoEditorRef.current = editor;
    editor.layout();
  };

  const handleDownloadCurrentCode = () => {
    const fileExtensionMap: { [key: string]: string } = {
      javascript: "js",
      python: "py",
      java: "java",
      csharp: "cs",
    };
    const fileExtension = fileExtensionMap[codeLanguage] || "txt";
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const filename = `code.${fileExtension}`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (roomCreatedAt) {
      const interval = setInterval(() => {
        const now = new Date();
        const timeDifference = Math.floor(
          (now.getTime() - roomCreatedAt.getTime()) / 1000
        );

        const hours = Math.floor(timeDifference / 3600);
        const minutes = Math.floor((timeDifference % 3600) / 60);
        const seconds = timeDifference % 60;

        setTimeElapsed(
          `${hours > 0 ? `${hours}h ` : ""}${
            minutes > 0 ? `${minutes}m ` : ""
          }${seconds}s`
        );
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [roomCreatedAt]);

  return (
    <Box display="flex" height="100vh">
      {/* Sidebar for user status and question details */}
      <Box
        width="400px"
        flexShrink={0}
        borderRight="1px solid #e2e8f0"
        p={4}
        bg="gray.100"
      >
        <Box
          mb={4}
          p={3}
          borderRadius="md"
          bg={activeUserCount > 0 ? "green.100" : "orange.100"}
          border="1px solid"
          borderColor={activeUserCount > 0 ? "green.300" : "orange.300"}
        >
          <Text
            fontSize="md"
            fontWeight="bold"
            color={activeUserCount > 0 ? "green.700" : "orange.700"}
          >
            {activeUserCount > 0
              ? "Your partner is in the room."
              : "You are the only user in the room."}
          </Text>
          {activeUserCount === 0 && (
            <Text fontSize="sm" mt={1} color="orange.600">
              The editor is now read-only.
            </Text>
          )}
          <Box>
            {roomCreatedAt && (
              <Text fontSize="sm" color="blue.700" mt={1}>
                Room Active Time: {timeElapsed}
              </Text>
            )}
          </Box>
        </Box>

        {assignedQuestionId ? (
          <QuestionSideBar
            assignedQuestionId={assignedQuestionId.toString()}
            userId={thisUserId}
            roomId={roomId}
            isOld={false}
          />
        ) : (
          <Text color="red.500" fontSize="sm">
            Loading question...
          </Text>
        )}
      </Box>

      {/* Main editor container */}
      <Box flex="1" display="flex" flexDirection="column" p={4} bg="white">
        <Text fontSize="lg" fontWeight="bold" color="gray.700">
          Code Editor
        </Text>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={4}
          p={3}
          borderRadius="md"
          border="1px solid #e2e8f0"
          bg="gray.50"
        >
          <Box display="flex" alignItems="center">
            {saveStatus && (
              <Text
                fontSize="sm"
                mr={3}
                color={
                  saveStatus === "saved"
                    ? "green.500"
                    : saveStatus === "saving"
                    ? "orange.500"
                    : "gray.500"
                }
              >
                {saveStatus === "saved"
                  ? "Saved"
                  : saveStatus === "saving"
                  ? "Saving..."
                  : formatTimeSinceLastSave()}
              </Text>
            )}

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
              colorScheme="gray"
              onClick={handleResetCode}
              mr={2}
            >
              Reset
            </Button>
            <Button
              size="sm"
              colorScheme="teal"
              onClick={handleDownloadCurrentCode}
              mr={2}
            >
              Download Code
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              onClick={() => setIsLeaveRoomDialogOpen(true)}
            >
              Leave Room
            </Button>
          </Box>
        </Box>

        <Box
          flex="1"
          borderRadius="md"
          border="1px solid #e2e8f0"
          overflow="hidden"
        >
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
          <Text color="red.500" mt={4} fontSize="sm">
            {leaveRoomMessage}
          </Text>
        )}

        <AlertDialog
          isOpen={isLeaveRoomDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={() => setIsLeaveRoomDialogOpen(false)}
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
                <Button
                  ref={cancelRef}
                  onClick={() => setIsLeaveRoomDialogOpen(false)}
                >
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
