import React, { useState, useEffect } from "react";
import {
  Box,
  Input,
  Text,
  Textarea,
  Select,
  Button,
  Spinner,
  useToast,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { Question } from "../types";
import useQuestionTopics from "../hooks/useQuestionTopics";
import useQuestionDifficulties from "../hooks/useQuestionDifficulties";
import MultiSelectMenu from "../MultiSelectMenu";

interface EditQuestionProps {
  question: Question;
  onSave: (updatedQuestion: Question) => void;
  onCancel: () => void;
}

const EditQuestion: React.FC<EditQuestionProps> = ({
  question,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(question.title);
  const [description, setDescription] = useState(question.description);
  const [category, setCategory] = useState<string[]>(question.category);
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const { enumTopics, error: enumTopicsError } = useQuestionTopics();
  const { difficulties, error: difficultiesError } = useQuestionDifficulties();
  const toast = useToast();

  useEffect(() => {
    setTitle(question.title);
    setDescription(question.description);
    setCategory(question.category);
    setDifficulty(question.difficulty);
  }, [question]);

  const handleSave = () => {
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

    onSave({
      ...question,
      title,
      description,
      category,
      difficulty,
    });
  };

  return (
    <Box maxWidth="600px" margin="0 auto" padding="4" boxShadow="md">
      {/* Edit title */}
      <FormControl mb={4}>
        <FormLabel>Title</FormLabel>
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </FormControl>

      {/* Edit description */}
      <FormControl mb={4}>
        <FormLabel>Description</FormLabel>
        <Textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minHeight="150px"
        />
      </FormControl>

      {/* Edit Topics */}
      <FormControl mb={4}>
        <FormLabel>Topics</FormLabel>
        {enumTopicsError ? (
          <Text color="red.500">{enumTopicsError}</Text>
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

      {/* Edit difficulty */}
      <FormControl mb={4}>
        <FormLabel>Difficulty</FormLabel>
        {difficultiesError ? (
          <Text color="red.500">{difficultiesError}</Text>
        ) : difficulties.length === 0 ? (
          <Spinner size="md" />
        ) : (
          <Select
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

      <Button colorScheme="blue" onClick={handleSave} mr={3}>
        Save Changes
      </Button>
      <Button onClick={onCancel}>Cancel</Button>
    </Box>
  );
};

export default EditQuestion;
