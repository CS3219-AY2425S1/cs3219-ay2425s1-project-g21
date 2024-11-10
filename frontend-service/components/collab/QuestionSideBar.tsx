import React, { useEffect, useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import ChatComponent from "../chat/ChatComponent";

interface Question {
  questionId: string,
  title: string,
  description: string,
  category: string[],
  difficulty: string,
  link: string,
}

interface QuestionSideBarProps {
  assignedQuestionId: string;
  userId: string;
  roomId: string;
  isOld: boolean;
}

const QuestionSideBar: React.FC<QuestionSideBarProps> = ({ assignedQuestionId, userId, roomId, isOld=false }) => {
  const [assignedQuestion, setAssignedQuestion] = useState<Question | null>(null)

  useEffect(() => {
    if (assignedQuestionId) {
      axios.get(`http://localhost:8080/api/questions/${assignedQuestionId}`).then(response => {
        console.log("Fetched question details:", response.data)
        setAssignedQuestion(response.data)
      }).catch(error => console.error("Failed to fetch question details", error))
    }
  }, [assignedQuestionId])

  return (
    <Box
      // width={isOpen ? "500px" : 0}
      transition="width 0.3s"
      // p={isOpen ? 4 : 0}
      borderWidth={1}
      borderRadius="md"
      boxShadow="md"
      borderColor="gray.200"
      bg="grey.50"
      height="100vh"
    >
      <Tabs>
        <TabList>
          <Tab>Question</Tab>
          { !isOld && <Tab>Chat</Tab> }
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box>
              {!assignedQuestionId ? (
                <Text color="red.500">Error: No question ID provided.</Text>
              ) : (
                <Box mb={4} p={4} bg="white" borderRadius="md">
                  <Text fontSize="xl" fontWeight="bold">{assignedQuestion?.title}</Text>
                  <Text color="gray.600">Category: {assignedQuestion?.category.join(', ')}</Text>
                  <Text color="gray.600">Difficulty: {assignedQuestion?.difficulty}</Text>
                  <Text color="gray.600">{assignedQuestion?.description}</Text>
                </Box>
              )}
            </Box>
          </TabPanel>
          { !isOld &&
            <TabPanel>
              {userId && roomId ? (
                <ChatComponent userId={userId} roomId={roomId} />
              ) : (
                <Box>Loading chat...</Box>
              )}
            </TabPanel>
          }
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default QuestionSideBar;
