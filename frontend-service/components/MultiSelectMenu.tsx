import React from "react";
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  MenuGroup,
  MenuOptionGroup,
  MenuItemOption,
  Box,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

interface MultiSelectMenuProps {
  options: string[];
  value: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
}

const MultiSelectMenu: React.FC<MultiSelectMenuProps> = ({
  options,
  value,
  onChange,
  maxSelections = 2,
}) => {
  const handleSelectionChange = (selectedValues: string[]) => {
    if (selectedValues.length > maxSelections) {
      selectedValues = selectedValues.slice(0, maxSelections);
    }
    onChange(selectedValues);
  };

  return (
    <Menu closeOnSelect={false}>
      <MenuButton
        as={Button}
        type="button"
        rightIcon={<ChevronDownIcon boxSize={5} />}
        width="100%"
        backgroundColor={"white"}
        borderColor={"gray.300"}
        borderWidth="1px"
        borderRadius="md"
        textAlign="left"
        fontSize="md"
        fontWeight="normal"
        _hover={{ backgroundColor: "none", outline: "none" }}
        _focus={{ backgroundColor: "none", outline: "none", boxShadow: "none" }}
      >
        {value.length > 0 ? `${value.join(", ")}` : "Select up to 2 topics"}
      </MenuButton>
      <MenuList
        minWidth="350px"
        minHeight="300px"
        maxHeight="350px"
        overflowY="auto"
        boxShadow="lg"
      >
        <MenuGroup>
          <MenuItem
            onClick={() => onChange([])}
            _hover={{ backgroundColor: "none", outline: "none" }}
            _focus={{ backgroundColor: "none", outline: "none" }}
          >
            Clear all
          </MenuItem>
        </MenuGroup>
        <MenuDivider />
        <MenuOptionGroup
          type="checkbox"
          value={value}
          onChange={(selectedValues) =>
            handleSelectionChange(selectedValues as string[])
          }
        >
          {options.map((option) => (
            <MenuItemOption
              key={option}
              value={option}
              _hover={{ backgroundColor: "none", outline: "none" }}
              _focus={{ backgroundColor: "none", outline: "none" }}
            >
              {option}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};

export default MultiSelectMenu;
