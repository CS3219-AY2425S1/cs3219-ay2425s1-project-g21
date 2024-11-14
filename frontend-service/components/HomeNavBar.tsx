"use client";

import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import AccountButton from "./account/AccountButton";

interface HomeNavBarProps {
  isAuthenticated: boolean;
  username: string;
  onLogout: () => void;
}

export default function HomeNavBar({
  isAuthenticated,
  username,
  onLogout,
}: HomeNavBarProps) {
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
              <Link to="/">
                <Button variant="ghost" fontWeight="bold" mr={86}>
                  History
                </Button>
              </Link>

              {/* if user is authenticated then show match me button */}
              {isAuthenticated && (
                <Link to="/match-me">
                  <Button variant="ghost" fontWeight="bold" mr={86}>
                    Match Me
                  </Button>
                </Link>
              )}
              <Link to="/aboutus">
                <Button variant="ghost" fontWeight="bold" mr={86}>
                  About Us
                </Button>
              </Link>

              {/* Only display login tab if user is not already authenticated */}
              {!isAuthenticated && (
                <>
                  <Link to="/login">
                    <Button variant="ghost" fontWeight="bold" mr={86}>
                      Login
                    </Button>
                  </Link>
                </>
              )}

              {/* Only display account tab if user is not already authenticated */}
              {isAuthenticated && (
                <AccountButton username={username} onLogout={onLogout} />
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
}
