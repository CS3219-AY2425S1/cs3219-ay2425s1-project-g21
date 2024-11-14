import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  Textarea,
  Select,
  useToast,
  Spinner,
  Text,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Question } from "../types";
import useQuestionTopics from "../hooks/useQuestionTopics";
import useQuestionDifficulties from "../hooks/useQuestionDifficulties";
import { Difficulty } from "../types";
import MultiSelectMenu from "../MultiSelectMenu";

interface AddQuestionProps {
  onAddQuestion: (question: Omit<Question, "questionId">) => void;
}

const AddQuestion: React.FC<AddQuestionProps> = ({ onAddQuestion }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const { enumTopics, error } = useQuestionTopics();
  const { difficulties, error: difficultiesError } = useQuestionDifficulties();
  const toast = useToast();

  const handleAddQuestion = () => {
    if (!title || !description || !category.length || !difficulty) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    onAddQuestion({
      title,
      description,
      category,
      difficulty,
    });

    setTitle("");
    setDescription("");
    setCategory([]);
    setDifficulty("");
  };

  return (
    <Box margin="0 auto" padding="4" boxShadow="md">
      {/* Enter title */}
      <FormControl mb={4}>
        <FormLabel>Title</FormLabel>
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>

      {/* Enter description */}
      <FormControl mb={4}>
        <FormLabel>Description</FormLabel>
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minHeight="150px"
        />
      </FormControl>

      {/* Select Topics */}
      <FormControl mb={4}>
        <FormLabel>Topics</FormLabel>
        {error ? (
          <Text color="red.500">{error}</Text>
        ) : enumTopics.length === 0 ? (
          <Spinner size="md" />
        ) : (
          <Box>
            <MultiSelectMenu
              options={enumTopics}
              value={category}
              onChange={setCategory}
              maxSelections={2}
            />
          </Box>
        )}
      </FormControl>

      {/* Select Difficulty from Fetched Data */}
      <FormControl mb={4}>
        <FormLabel>Difficulty</FormLabel>
        {difficultiesError ? (
          <Text color="red.500">{difficultiesError}</Text>
        ) : difficulties.length === 0 ? (
          <Spinner size="md" />
        ) : (
          <Select
            placeholder="Select Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {difficulties.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </Select>
        )}
      </FormControl>

      <Button colorScheme="blue" onClick={handleAddQuestion}>
        Add Question
      </Button>
    </Box>
  );
};

export default AddQuestion;
