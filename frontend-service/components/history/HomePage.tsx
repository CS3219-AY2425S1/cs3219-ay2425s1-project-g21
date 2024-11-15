import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  Box,
  Text,
  Spinner,
  InputLeftAddon,
  InputGroup,
  Card,
  Button,
  Flex,
} from "@chakra-ui/react";
import useQuestions from "../hooks/useQuestions";

const HomePage: React.FC = () => {
  interface QuestionHistory {
    roomId: string;
    selectedQuestionId: string;
    questionTitle: string;
    attemptDateTime: string;
    difficulty?: string;
  }

  const {
    questions,
    loading: questionsLoading,
    error: questionsError,
  } = useQuestions();
  const [history, setHistory] = useState<QuestionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7;
  const navigate = useNavigate();

  // Fetch question history data
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_HISTORY_SERVICE_API_URL}/history/data`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // If the status code is 404, set history to an empty array
        if (response.status === 404) {
          setHistory([]);
          setLoading(false);
          return;
        }

        if (!response.ok) throw new Error("Failed to load history data.");

        const data = await response.json();
        const historyArray = Object.values(data);

        // Map history with question details from useQuestions
        const mappedHistory = historyArray.map((historyItem: any) => {
          console.log(
            "History Item ID and Type:",
            historyItem.selectedQuestionId,
            typeof historyItem.selectedQuestionId
          );

          const questionDetails = questions.find((q) => {
            console.log(
              "Checking Question ID and Type:",
              q.questionId,
              typeof q.questionId
            );
            return q.questionId === historyItem.selectedQuestionId; // Use `questionId` for matching
          });

          console.log("Question Details Found:", questionDetails);

          return {
            ...historyItem,
            questionTitle: questionDetails?.title || "Unknown Title",
            difficulty: questionDetails?.difficulty || "Unknown",
          };
        });

        setHistory(mappedHistory);
        setLoading(false);
      } catch (err) {
        setError("Failed to load history data.");
        setLoading(false);
      }
    };

    if (!questionsLoading) {
      fetchHistory();
    }
  }, [questions, questionsLoading]);

  // Pagination
  const filteredHistory = history
    .filter((question) =>
      question.questionTitle.toLowerCase().includes(search.toLowerCase())
    )
    .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const totalPages = Math.ceil(history.length / rowsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  if (loading || questionsLoading) {
    return (
      <Box textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error || questionsError) {
    return <Text color="red.500">Error: {error || questionsError}</Text>;
  }

  return (
    <Box display="flex" justifyContent="flex-end">
      <Card p={6} borderRadius="lg" minW="80%" maxW="100%" width="100%">
        <Text fontSize="2xl" fontWeight="bold" mb={4} textAlign="left">
          Attempt History
        </Text>
        <Box display="flex" justifyContent="space-between" mb={4}>
          <InputGroup mr={4}>
            <InputLeftAddon fontWeight="bold">Search:</InputLeftAddon>
            <Input
              placeholder="your questions..."
              value={search}
              onChange={handleSearchChange}
              size="md"
              focusBorderColor="blue.500"
            />
          </InputGroup>
        </Box>

        {/* Table */}
        <TableContainer borderRadius={20}>
          <Table
            variant="striped"
            size="lg"
            border="1px"
            borderColor="gray.200"
            sx={{ fontFamily: "Poppins, sans-serif" }}
          >
            <Thead>
              <Tr>
                <Th bgColor="yellow.300">ID</Th>
                <Th bgColor="yellow.300">Title</Th>
                <Th bgColor="yellow.300">Submitted At</Th>
                <Th bgColor="yellow.300">Time Taken</Th>
                <Th bgColor="yellow.300">Difficulty</Th>
                <Th bgColor="yellow.300">Submission</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredHistory.map((question) => (
                <Tr key={question.roomId}>
                  <Td>{question.selectedQuestionId}</Td>
                  <Td>
                    <Text
                      isTruncated
                      maxWidth="400px"
                      title={question.questionTitle}
                      align="left"
                    >
                      {question.questionTitle}
                    </Text>
                  </Td>
                  <Td>
                    {new Date(question.attemptDateTime).toLocaleString(
                      "en-SG",
                      {
                        timeZone: "Asia/Singapore",
                        hour12: false, // or true if you want 12-hour format
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      }
                    )}
                  </Td>
                  <Td>{question.attemptTimeTaken || "Unknown"}</Td>
                  <Td>
                    <Box
                      display="inline-block"
                      px={2}
                      py={1}
                      borderRadius="md"
                      bgColor={
                        question.difficulty === "Easy"
                          ? "green.500"
                          : question.difficulty === "Medium"
                          ? "yellow.400"
                          : "red.500"
                      }
                      color="white"
                      fontWeight="bold"
                      textAlign="center"
                    >
                      {question.difficulty}
                    </Box>
                  </Td>

                  <Td>
                    <Button
                      colorScheme="blue"
                      onClick={() => navigate(`/room/${question.roomId}`)}
                    >
                      View
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Flex justify="space-between" mt={4} align="center">
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Box>
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              mr={2}
            >
              Previous
            </Button>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Box>
        </Flex>
      </Card>
    </Box>
  );
};

export default HomePage;
