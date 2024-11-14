import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import useQuestions from "../hooks/useQuestions";
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
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import AddQuestion from "./AddQuestion";
import EditQuestion from "./EditQuestion";
import { Question, Difficulty } from "../types";

interface QuestionListProps {
  userIsAdmin: boolean;
}

const QuestionList: React.FC<QuestionListProps> = ({ userIsAdmin }) => {
  const {
    questions,
    loading,
    error,
    addQuestion,
    deleteQuestion,
    editQuestion,
  } = useQuestions();
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: SortableKeys;
    direction: "asc" | "desc" | "both";
  }>({ key: "questionId", direction: "both" });
  const [currentPage, setCurrentPage] = useState(1);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [questionTitleToDelete, setQuestionTitleToDelete] = useState<
    string | null
  >(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [questionToEdit, setQuestionToEdit] = useState<Question | null>(null);
  const rowsPerPage = 7;

  type SortableKeys = keyof Question;

  const difficultyOrder = {
    [Difficulty.EASY]: 1,
    [Difficulty.MEDIUM]: 2,
    [Difficulty.HARD]: 3,
  };

  // Filtered and Sorted Questions
  const filteredQuestions = questions
    .filter((question) =>
      question.title.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortConfig.key) {
        if (sortConfig.key === "difficulty") {
          // Sort using custom order for difficulty
          const diffA = difficultyOrder[a.difficulty as Difficulty] || 0;
          const diffB = difficultyOrder[b.difficulty as Difficulty] || 0;
          return sortConfig.direction === "asc" ? diffA - diffB : diffB - diffA;
        } else {
          if (sortConfig.direction === "asc") {
            return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
          } else if (sortConfig.direction === "desc") {
            return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
          }
        }
      }
      return 0; // No sorting
    });

  // Pagination Logic
  const indexOfLastQuestion = currentPage * rowsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - rowsPerPage;
  const currentQuestions = filteredQuestions.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const totalPages = Math.ceil(filteredQuestions.length / rowsPerPage);

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

  const handleSort = (key: string) => {
    let direction = "asc"; // Default to ascending
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc"; // Change to descending
      } else if (sortConfig.direction === "desc") {
        direction = "both"; // Reset to both (no sorting)
      }
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleAddQuestion = (newQuestion: Omit<Question, "questionId">) => {
    addQuestion(newQuestion);
  };

  const openDeleteDialog = (questionId: number, questionTitle: string) => {
    setQuestionToDelete(questionId);
    setQuestionTitleToDelete(questionTitle);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setQuestionToDelete(null);
    setQuestionTitleToDelete(null);
    setDeleteDialogOpen(false);
  };

  const confirmDelete = () => {
    if (questionToDelete !== null) {
      deleteQuestion(questionToDelete);
      closeDeleteDialog();
    }
  };

  const openEditDialog = (question: Question) => {
    setQuestionToEdit(question);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setQuestionToEdit(null);
    setEditDialogOpen(false);
  };

  const handleEditSubmit = (questionToEdit: Question) => {
    if (questionToEdit) {
      editQuestion(questionToEdit.questionId, {
        title: questionToEdit.title,
        description: questionToEdit.description,
        category: questionToEdit.category,
        difficulty: questionToEdit.difficulty,
      });
      closeEditDialog();
    }
  };

  if (loading) {
    return (
      <Box textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
  }

  return (
    <Box display="flex" justifyContent="flex-end">
      <Card p={6} borderRadius="lg" minW="80%" maxW="100%" width="100%">
        <Box display="flex" justifyContent="space-between" mb={4}>
          {/* Search bar */}
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

          {/* Add Question Button */}
          {userIsAdmin && (
            <IconButton
              aria-label="Add Question"
              icon={<AddIcon />}
              colorScheme="blue"
              onClick={onOpen}
            />
          )}
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
                {/* ID Column */}
                <Th
                  cursor="pointer"
                  bgColor="yellow.300"
                  onClick={() => handleSort("questionId")}
                  fontFamily="Poppins, sans-serif"
                >
                  ID{" "}
                  {sortConfig.key === "questionId"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.direction === "desc"
                      ? "↓"
                      : "↑↓"
                    : "↑↓"}
                </Th>

                {/* Title Column */}
                <Th
                  cursor="pointer"
                  bgColor="yellow.300"
                  onClick={() => handleSort("title")}
                  fontFamily="Poppins, sans-serif"
                >
                  Title{" "}
                  {sortConfig.key === "title"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.direction === "desc"
                      ? "↓"
                      : "↑↓"
                    : "↑↓"}
                </Th>

                {/* Difficulty Column */}
                <Th
                  cursor="pointer"
                  bgColor="yellow.300"
                  onClick={() => handleSort("difficulty")}
                  fontFamily="Poppins, sans-serif"
                >
                  Difficulty{" "}
                  {sortConfig.key === "difficulty"
                    ? sortConfig.direction === "asc"
                      ? "↑"
                      : sortConfig.direction === "desc"
                      ? "↓"
                      : "↑↓"
                    : "↑↓"}
                </Th>

                {/* Topic Column */}
                <Th bgColor="yellow.300" fontFamily="Poppins, sans-serif">
                  Topic
                </Th>

                {/* Actions Column */}
                {userIsAdmin && (
                  <Th
                    bgColor="yellow.300"
                    fontFamily="Poppins, sans-serif"
                    width="10%"
                  ></Th>
                )}
              </Tr>
            </Thead>

            {/* Show message in table body if no results found */}
            {filteredQuestions.length === 0 ? (
              <Text color="red.500" textAlign="center" mt={4}>
                No questions found for your search.
              </Text>
            ) : (
              <Tbody>
                {currentQuestions.map((question) => (
                  <Tr key={question.questionId}>
                    <Td>{question.questionId}</Td>

                    <Td>
                      <Link to={`/questions/${question.questionId}`}>
                        <Text
                          isTruncated
                          maxWidth="400px"
                          title={question.title}
                          align="left"
                        >
                          {question.title}
                        </Text>
                      </Link>
                    </Td>

                    <Td>
                      <Box
                        display="inline-block"
                        px={2}
                        py={1}
                        borderRadius="md"
                        bgColor={
                          question.difficulty.toLowerCase() === "easy"
                            ? "green.500"
                            : question.difficulty.toLowerCase() === "medium"
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

                    <Td>{question.category.join(", ")}</Td>

                    {userIsAdmin && (
                      <Td>
                        {/* Delete question button */}
                        <Button
                          colorScheme="red"
                          onClick={() =>
                            openDeleteDialog(
                              question.questionId,
                              question.title
                            )
                          }
                        >
                          Delete
                        </Button>

                        {/* Edit question button */}
                        <Button
                          colorScheme="teal"
                          ml={2}
                          onClick={() => openEditDialog(question)}
                        >
                          Edit
                        </Button>
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            )}
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredQuestions.length === 0 ? (
          <Flex justify="space-between" mt={4} align="center">
            <Text mt={4} align="center">
              Page 0 of 0
            </Text>
          </Flex>
        ) : (
          <Flex justify="space-between" mt={4} align="center">
            {/* Page Info on the Left */}
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
        )}
      </Card>

      {/* Modal for Adding Question */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minWidth="600px" height="fit-content">
          <ModalHeader>Add a New Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AddQuestion onAddQuestion={handleAddQuestion} />
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>

      {/* AlertDialog for Delete Confirmation */}
      <AlertDialog
        isOpen={deleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDeleteDialog}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Question
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this question "
              <strong>{questionTitleToDelete}</strong>"? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteDialog}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modal for Editing Question */}
      <Modal isOpen={editDialogOpen} onClose={closeEditDialog}>
        <ModalOverlay />
        <ModalContent minWidth="600px" height="fit-content">
          <ModalHeader>Edit Question</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {questionToEdit && (
              <EditQuestion
                question={questionToEdit}
                onSave={handleEditSubmit}
                onCancel={closeEditDialog}
              />
            )}
          </ModalBody>
          <ModalFooter />
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default QuestionList;
