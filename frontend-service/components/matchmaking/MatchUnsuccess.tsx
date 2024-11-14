import React from "react";
import { Button, Text, Box, Heading, Flex } from "@chakra-ui/react";

interface UnsuccessfulMatchProps {
  onRetry: () => void;
  onBackToDashboard: () => void;
}

const UnsuccessfulMatch: React.FC<UnsuccessfulMatchProps> = ({
  onRetry,
  onBackToDashboard,
}) => {
  return (
    <Box textAlign="center" mt={10}>
      <Flex align="center" flexDirection="column">
        <Heading mb={4}>No peers found at this moment...</Heading>
        <Text fontSize="lg" mb={6}>
          Sorry, no match was found. Let's try again later.
        </Text>
        <Flex justifyContent="center" width="100%">
          <Button onClick={onRetry} mx={2}>
            Retry Matching
          </Button>
          <Button colorScheme="blue" onClick={onBackToDashboard} mx={2}>
            Back to dashboard
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default UnsuccessfulMatch;
