import React, { useState } from "react";
import { Button, Select, Box, Heading, Flex, useToast } from "@chakra-ui/react";
import useQuestionDifficulties from "../../components/hooks/useQuestionDifficulties";
import useQuestionTopics from "../../components/hooks/useQuestionTopics";

interface MatchMeProps {
  onMatchMe: () => void;
  selectedTopic: string;
  updateSelectedTopic: React.Dispatch<React.SetStateAction<string>>;
  selectedDifficulty: string;
  updateSelectedDifficulty: React.Dispatch<React.SetStateAction<string>>;
}

const MatchMe: React.FC<MatchMeProps> = ({
  onMatchMe,
  selectedTopic,
  updateSelectedTopic,
  selectedDifficulty,
  updateSelectedDifficulty
}) => {
  const { difficulties } = useQuestionDifficulties();
  const { topics } = useQuestionTopics();
  const toast = useToast();

  const handleMatchMeClick = () => {
    if (selectedTopic && selectedDifficulty) {
      onMatchMe();
    } else {
      toast({
        title: "Selection required.",
        description: "Please select both a topic and a difficulty level.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Box textAlign="center" mt={10}>
      <Flex align="center" flexDirection="column">
        <Heading as="h1" mb={6}>
          Find a Match
        </Heading>

        <Box mb={6}>
          <Select
            placeholder="Select a topic"
            value={selectedTopic}
            onChange={(e) => updateSelectedTopic(e.target.value)}
            mb={4}
            w="300px"
          >
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>

          <Select
            minW=""
            placeholder="Select difficulty"
            value={selectedDifficulty}
            onChange={(e) => updateSelectedDifficulty(e.target.value)}
            w="300px"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </Select>
        </Box>

        <Button colorScheme="blue" onClick={handleMatchMeClick}>
          Match Me
        </Button>
      </Flex>
    </Box>
  );
};

export default MatchMe;
