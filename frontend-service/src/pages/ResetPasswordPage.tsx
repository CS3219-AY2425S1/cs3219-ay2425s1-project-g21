import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
} from "@chakra-ui/react";

const PasswordResetRequest: React.FC = () => {
  const [identifier, setIdentifier] = useState(""); // Can be email or username
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send request to backend
      const response = await fetch("http://user-service/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier }), // Sending identifier (email or username)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "An error occurred");
      }

      toast({
        title: "Password reset email sent",
        description:
          "If an account exists with this identifier, a password reset email will be sent.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: "Password reset failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxWidth="400px"
      margin="auto"
      mt={8}
      p={4}
      borderWidth="1px"
      borderRadius="md"
      boxShadow="md"
    >
      <form onSubmit={handlePasswordReset}>
        <FormControl id="identifier" isRequired>
          <FormLabel>Enter Email or Username</FormLabel>
          <Input
            type="text"
            placeholder="Email or Username"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </FormControl>

        <Button
          mt={4}
          colorScheme="blue"
          type="submit"
          width="100%"
          isLoading={loading}
        >
          Reset Password
        </Button>
      </form>
      <Text mt={4} fontSize="sm" color="gray.600" textAlign="center">
        Enter your email or username to receive a password reset email if the
        account exists.
      </Text>
    </Box>
  );
};

export default PasswordResetRequest;
