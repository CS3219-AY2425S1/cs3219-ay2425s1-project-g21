"use client";

import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";

export default function HomeNavBar() {
  return (
    <Box as="nav" position="fixed" top="0" left="0" right="0" zIndex="1000">
      <Box
        bg={useColorModeValue("gray.100", "gray.900")}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
      >
        <Container maxW="container.xl">
          <Flex
            color={useColorModeValue("gray.600", "white")}
            minH={"80px"}
            py={{ base: 2 }}
            px={{ base: 4 }}
            align={"center"}
            justify={"flex-end"}
          >
            <Flex align={"center"}>
              <Link to="/questions">
                <Button variant="ghost" fontWeight="bold" mr={86}>
                  Questions
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" fontWeight="bold" mr={86}>
                  Dashboard
                </Button>
              </Link>
              <Link to="/match-me">
                <Button variant="ghost" fontWeight="bold" mr={86}>
                  Match Me
                </Button>
              </Link>
              <Link to="/about-us">
                <Button variant="ghost" fontWeight="bold" mr={86}>
                  About Us
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" fontWeight="bold" mr={86}>
                  Login
                </Button>
              </Link>
              <Button
                as={Link}
                to="/my-account"
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"blue.300"}
                _hover={{
                  bg: "blue.300",
                }}
                ml={4}
              >
                My Account
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
