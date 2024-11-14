import { Box, Text, Heading, VStack, HStack, Button } from '@chakra-ui/react'
import { useNavigate, Outlet } from 'react-router-dom'

interface AccountPageProps {
  id?: string
  username?: string
  email?: string
  isAdmin?: boolean
}

export default function AccountPage({ id, username, email }: AccountPageProps) {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <Box width="100%" maxWidth="800px" margin="auto" mt={8} p={4}>
      {/* Banner with user information */}
      <Box
        width="100%"
        p={4}
        mb={4}
        borderRadius="8px"
        bg="blue.50"
        border="1px solid #cbd5e0"
        textAlign="center"
      >
        <Heading as="h3" size="md">Welcome, {username}</Heading>
        <Text>PeerPrep ID: {id}</Text>
        <Text>Email: {email}</Text>
      </Box>

      <HStack width="100%" spacing={8} alignItems="start">
        {/* Sidebar Navigation */}
        <VStack width="200px" spacing={4} align="stretch" p={4} borderRadius="8px" border="1px solid #e2e8f0" bg="gray.50">
          <Button variant="ghost" justifyContent="start" onClick={() => handleNavigation('/account/password')}>
            Change Password
          </Button>
          <Button variant="ghost" justifyContent="start" onClick={() => handleNavigation('/account/delete')}>
            Delete Account
          </Button>
        </VStack>

        {/* Main Profile Content or Nested Routes */}
        <Box flex="1" p={4} borderRadius="8px" border="1px solid #e2e8f0" bg="gray.50">
          <Outlet /> {/* Renders the nested route content here */}
        </Box>
      </HStack>
    </Box>
  )
}
