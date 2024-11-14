import { Menu, MenuButton, MenuList, MenuItem, Button, Icon } from "@chakra-ui/react";
import { FaUser } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

interface AccountButtonProps {
  id?: string
  username?: string
  email?: string
  isAdmin?: boolean
  onLogout: () => void
}

export default function AccountButton({ username, onLogout }: AccountButtonProps) {
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<Icon as={FaUser} />}
        fontSize="sm"
        fontWeight={600}
        color="white"
        bg="blue.300"
        _hover={{ bg: "blue.400" }}
        ml={4}
      >
        {username}
      </MenuButton>
      <MenuList>
        {/* Option to navigate to the account page */}
        <MenuItem as={RouterLink} to="/account">
          Account
        </MenuItem>
        {/* Logout option */}
        <MenuItem onClick={onLogout}>
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  );
}