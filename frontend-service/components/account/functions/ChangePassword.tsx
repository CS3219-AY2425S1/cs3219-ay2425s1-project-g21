import { useState } from 'react';
import { FormControl, FormLabel, Input, Button, Box, useToast } from '@chakra-ui/react';

interface ChangePasswordProps {
  userId: string;
}

export default function ChangePassword({ userId }: ChangePasswordProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Check if newPassword and confirmPassword match
    if (newPassword !== confirmPassword) {
      toast({
        title: "New passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Retrieve the JWT token
      const token = localStorage.getItem('token');

      // Send request with oldPassword, newPassword, and confirmPassword
      const response = await fetch(`http://localhost:3001/users/${userId}/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });

      if (!response.ok) {
        throw new Error((await response.json()).message || 'An error occurred');
      }

      const data = await response.json();

      // Display success toast
      toast({
        title: data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Display error toast
      toast({
        title: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxWidth="400px" margin="auto" mt={8} p={4} borderWidth="1px" borderRadius="md" boxShadow="md">
      <form onSubmit={handleChangePassword}>
        <FormControl id="oldPassword" isRequired>
          <FormLabel>Old Password</FormLabel>
          <Input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </FormControl>

        <FormControl id="newPassword" isRequired mt={4}>
          <FormLabel>New Password</FormLabel>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </FormControl>

        <FormControl id="confirmPassword" isRequired mt={4}>
          <FormLabel>Confirm New Password</FormLabel>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </FormControl>

        <Button mt={4} colorScheme="blue" type="submit" width="100%">
          Change Password
        </Button>
      </form>
    </Box>
  );
}
