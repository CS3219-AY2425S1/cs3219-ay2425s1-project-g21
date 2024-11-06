import { useState, useEffect } from "react";
import { Question } from "../types";
import { useToast } from "@chakra-ui/react";

const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchQuestions = async () => {
    try {
      const response = await fetch("http://question-service/api/questions");
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = async (newQuestion: Question) => {
    try {
      const response = await fetch("http://question-service/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newQuestion),
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Question added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchQuestions();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add question",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while adding the question.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deleteQuestion = async (questionId: number) => {
    try {
      const response = await fetch(
        `http://question-service/api/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast({
          title: "Question deleted.",
          description: "The question has been deleted successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        fetchQuestions();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to delete question.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while deleting the question.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const editQuestion = async (
    questionId: number,
    updatedQuestion: Partial<Question>
  ) => {
    try {
      const response = await fetch(
        `http://question-service/api/questions/${questionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedQuestion),
        }
      );

      if (response.ok) {
        toast({
          title: "Question updated.",
          description: "The question has been updated successfully.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        fetchQuestions();
      } else {
        const data = await response.json();
        toast({
          title: "Error",
          description: data.message || "Failed to update question.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while updating the question.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    questions,
    loading,
    error,
    fetchQuestions,
    addQuestion,
    deleteQuestion,
    editQuestion,
  };
};

export default useQuestions;
