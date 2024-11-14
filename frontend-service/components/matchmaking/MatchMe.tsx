import React, { useState, useEffect } from "react";
import { Button, Select, Box, Heading, Flex, useToast } from "@chakra-ui/react";

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
  updateSelectedDifficulty,
}) => {
  const toast = useToast();
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [allDifficulties, setAllDifficulties] = useState<string[]>([]);
  const [filteredDifficulties, setFilteredDifficulties] = useState<string[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<string[]>([]);

  // Fetch all topics on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/questions/topics')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const sortedTopics = data.sort((a, b) => a.localeCompare(b));
          setAllTopics(sortedTopics);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch topics:", error);
        toast({
          title: "Error",
          description: "Failed to fetch topics.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [toast]);

  // Fetch all difficulties on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/questions/difficulties')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const difficultyOrder = ['Easy', 'Medium', 'Hard'];
          const sortedDifficulties = data.sort(
            (a, b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b)
          );
          setAllDifficulties(sortedDifficulties);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch difficulties:", error);
        toast({
          title: "Error",
          description: "Failed to fetch difficulties.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
  }, [toast]);

  // Update difficulties based on the selected topic
  useEffect(() => {
    if (selectedTopic) {
      fetch(`http://localhost:8080/api/questions/difficulties?category=${selectedTopic}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const difficultyOrder = ['Easy', 'Medium', 'Hard'];
            const sortedDifficulties = data.sort(
              (a, b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b)
            );
            setFilteredDifficulties(sortedDifficulties);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch difficulties for the topic:", error);
        });
    } else {
      const difficultyOrder = ['Easy', 'Medium', 'Hard'];
      const sortedDifficulties = allDifficulties.sort(
        (a, b) => difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b)
      );
      setFilteredDifficulties(sortedDifficulties);
    }
  }, [selectedTopic, allDifficulties]);

  // Update topics based on the selected difficulty
  useEffect(() => {
    if (selectedDifficulty) {
      fetch(`http://localhost:8080/api/questions/topics?difficulty=${selectedDifficulty}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const sortedTopics = data.sort((a, b) => a.localeCompare(b));
            setFilteredTopics(sortedTopics);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch topics for the difficulty:", error);
        });
    } else {
      const sortedTopics = allTopics.sort((a, b) => a.localeCompare(b));
      setFilteredTopics(sortedTopics);
    }
  }, [selectedDifficulty, allTopics]);

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
            {filteredTopics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Select difficulty"
            value={selectedDifficulty}
            onChange={(e) => updateSelectedDifficulty(e.target.value)}
            w="300px"
          >
            {filteredDifficulties.map((difficulty) => (
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
