import React, { useEffect, useState, useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Box, Button, Select, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '../../FirebaseConfig';
import * as monaco from 'monaco-editor';
import QuestionSideBar from './QuestionSidebar';
import axios from 'axios';

const languageType: { [key: string]: string } = {
  javascript: '// Start writing your JavaScript code here...',
  python: '# Start writing your Python code here...',
  java: '// Start writing your Java code here...',
  csharp: '// Start writing your C# code here...'
};

interface OldCodeEditorProps {
  roomId: string;
  thisUserId: string;
}

const OldCodeEditor: React.FC<OldCodeEditorProps> = ({ roomId, thisUserId }) => {
  const [code, setCode] = useState('// Start writing your code here...');
  const [codeLanguage, setCodeLanguage] = useState<string>('javascript');
  const [assignedQuestionId, setAssignedQuestionId] = useState<number | null>(null);
  const navigate = useNavigate();
  const codeRef = ref(FIREBASE_DB, `rooms/${roomId}/code`);

  const monacoEditorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // Fetching assigned question ID
  useEffect(() => {
    const fetchAssignedQuestion = async () => {
      // Fetch assigned question ID from the server
      try {
        const response = await axios.get(`http://localhost:5001/room/data/${roomId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAssignedQuestionId(response.data.selectedQuestionId);
      } catch (error) {
        console.error("Failed to fetch assigned question:", error);
      }
    };

    fetchAssignedQuestion();
  }, [roomId]);

  // Fetching code from Firebase
  useEffect(() => {
    const unsubscribe = onValue(codeRef, (snapshot) => {
      const updatedCode = snapshot.val();
      setCode(updatedCode?.[codeLanguage] || languageType[codeLanguage]);
    });
    return () => {
      unsubscribe();
    };
  }, [codeLanguage, codeRef]);

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    setCodeLanguage(selectedLanguage);
  };

  const handleLeaveRoom = () => {
    navigate('/');
  };

  return (
    <Box display="flex" height="100vh">
      <Box width="400px" flexShrink={0} borderRight="1px solid #e2e8f0">
        {/* Display question details */}
        {assignedQuestionId ? (
          <QuestionSideBar assignedQuestionId={assignedQuestionId.toString()} userId={thisUserId} roomId={roomId} isOld={true} />
        ) : (
          <Text color="red.500">Loading question...</Text>
        )}
      </Box>

      <Box flex="1" maxWidth="900px" margin="auto" p={4} borderRadius="8px" border="1px solid #e2e8f0" bg="gray.50">
        <Text fontSize="lg" fontWeight="bold" mb={4}>Code Viewer</Text>

        <Box display="flex" alignItems="center" mb={3}>
          <Select size="sm" width="150px" mr={3} value={codeLanguage} onChange={handleLanguageChange}>
            {Object.keys(languageType).map(lang => (
              <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
            ))}
          </Select>
          <Button size="sm" colorScheme="blue" onClick={handleLeaveRoom}>Leave Room</Button>
        </Box>

        <Box height="80vh" width="100%" overflow="hidden">
          <MonacoEditor
            height="100%"
            language={codeLanguage}
            theme="vs-light"
            value={code}
            onMount={(editor) => { monacoEditorRef.current = editor; }}
            options={{
              fontSize: 16,
              fontFamily: "'Fira Code', monospace",
              minimap: { enabled: false },
              lineNumbers: "on",
              readOnly: true // Make editor read-only
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default OldCodeEditor;
