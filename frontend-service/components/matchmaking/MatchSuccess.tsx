import React, { useEffect } from "react";
import { Text, Box, Heading, Flex } from "@chakra-ui/react";

const MatchSuccess: React.FC = () => {
  useEffect(() => {
    const timerId = setTimeout(() => {}, 3000); // Redirect after 3 seconds
    return () => clearTimeout(timerId);
  }, []);

  return (
    <Box textAlign="center" mt={10}>
      <Flex align="center" flexDirection="column">
        <Heading mb={4}>Peer Found!</Heading>
        <Text fontSize="lg" mb={6}>
          Redirecting you to your room...
        </Text>
      </Flex>
    </Box>
  );
};

export default MatchSuccess;
