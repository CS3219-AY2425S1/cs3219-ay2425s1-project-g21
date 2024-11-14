import React from 'react';
import { Box, Heading, Text, VStack, Container } from '@chakra-ui/react';

const AboutUs: React.FC = () => {
  return (
    <Container maxW="container.md" py={10} px={6}>
      {/* Main Title Section */}
      <Box textAlign="center" mb={12}>
        <Heading as="h1" size="2xl" color="#65afff">
          About PeerPrep
        </Heading>
        <Text fontSize="lg" mt={4} color="gray.600">
          Practice Coding Together, Anytime, Anywhere, with Anyone!!
        </Text>
      </Box>

      {/* Introduction Section */}
      <Box bg="gray.50" p={6} borderRadius="md" boxShadow="md">
        <VStack spacing={4} align="start">
          <Text fontSize="md" color="gray.700">
            <strong style={{ color: '#65afff' }}>PeerPrep</strong> is an interactive coding platform designed for programmers of all levels to improve their problem-solving skills and collaborate with peers in real-time. Inspired by platforms like <strong style={{ color: '#65afff' }}>LeetCode</strong> and taking cues from Google Docs, PeerPrep offers a unique live-matching feature that connects you with other users for a collaborative coding experience.
          </Text>
        </VStack>
      </Box>

      {/* Why PeerPrep Section */}
      <Box bg="gray.50" mt={10} p={8} borderRadius="md" boxShadow="md">
        <Heading as="h2" size="lg" color="#65afff">
          Why PeerPrep?
        </Heading>
        <Text fontSize="md" mt={4} color="gray.700">
          At PeerPrep, we believe that learning together is better. Whether you're preparing for technical interviews or honing your programming skills, PeerPrep provides a supportive environment where you can:
        </Text>

        <VStack align="start" pl={4} spacing={3} mt={4}>
          <Text>• Practice coding questions across various topics and difficulty levels.</Text>
          <Text>• Get matched with other peers based on your chosen topic and difficulty level.</Text>
          <Text>• Chat with others in the coding editor with our chat function.</Text>
          <Text>• Collaborate in real-time with a shared coding editor.</Text>
          <Text>• Receive instant feedback and work through problems together.</Text>
        </VStack>
      </Box>

      {/* Key Features Section */}
      <Box bg="gray.50" mt={10} p={8} borderRadius="md" boxShadow="md">
        <Heading as="h2" size="lg" color="#65afff">
          Key Features
        </Heading>
        <Text fontSize="md" color="gray.700">
          PeerPrep contains a plethora of features that will enhance your coding and learning experience:
        </Text>

        <VStack align="start" pl={4} spacing={3} mt={4}>
          <Text>• <strong style={{ color: '#65afff' }}>Live Matching</strong>: Connect with other users looking to solve the same type of problems as you!</Text>
          <Text>• <strong style={{ color: '#65afff' }}>Chat</strong>: Chat with others in the same room, where you can share your thoughts with them.</Text>
          <Text>• <strong style={{ color: '#65afff' }}>Real-time Code Collaboration</strong>: Solve coding challenges together with others in a shared workspace, similar to Google Docs but for code.</Text>
          <Text>• <strong style={{ color: '#65afff' }}>Large question repository</strong>: Practice from a variety of questions, across different topics and difficulty levels such as Arrays, Algorithms, Data Structures, and more!</Text>
          <Text>• <strong style={{ color: '#65afff' }}>Instant Feedback</strong>: Submit your code for evaluation and immediately know if you did it correctly.</Text>
        </VStack>
      </Box>

      {/* Mission Section */}
      <Box bg="gray.50" mt={10} p={8} borderRadius="md" boxShadow="md">
        <Heading as="h2" size="lg" color="#65afff">
          Our Mission
        </Heading>
        <Text fontSize="md" color="gray.700">
          Our mission is to foster a collaborative and interactive learning environment for programmers, by enabling you to learn together with others, and share your knowledge and experiences through coding.
        </Text>
      </Box>

      {/* Join Us Section */}
      <Box bg="gray.50" mt={10} p={8} borderRadius="md" boxShadow="md" textAlign="center">
        <Heading as="h2" size="lg" color="#65afff">
          Join Us
        </Heading>
        <Text fontSize="md" color="gray.700">
          Ready to start your coding journey? Join PeerPrep now and start acing your job interviews!
        </Text>
      </Box>
    </Container>
  );
};

export default AboutUs;
