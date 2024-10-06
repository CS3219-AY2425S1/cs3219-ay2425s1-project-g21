// Switch to the 'question-db' database
db = db.getSiblingDB('question-db');

// Insert sample questions provided
db.questions.insertMany([
    {
        "questionId": "1",
        "title": "Reverse a String",
        "description": "Write a function that reverses a string. The input string is given as an array of characters. You must modify the input array in-place with O(1) extra memory.",
        "category": "Strings, Algorithms",
        "difficulty": "Easy",
        "link": "https://leetcode.com/problems/reverse-string/"
    },
    {
        "questionId": "2",
        "title": "Linked List Cycle Detection",
        "description": "Implement a function to detect if a linked list contains a cycle.",
        "category": "Data Structures, Algorithms",
        "difficulty": "Easy",
        "link": "https://leetcode.com/problems/linked-list-cycle/"
    },
    {
        "questionId": "3",
        "title": "Roman to Integer",
        "description": "Given a Roman numeral, convert it to an integer.",
        "category": "Algorithms",
        "difficulty": "Easy",
        "link": "https://leetcode.com/problems/roman-to-integer/"
    },
    {
        "questionId": "4",
        "title": "Add Binary",
        "description": "Given two binary strings a and b, return their sum as a binary string.",
        "category": "Bit Manipulation, Algorithms",
        "difficulty": "Easy",
        "link": "https://leetcode.com/problems/add-binary/"
    },
    {
        "questionId": "5",
        "title": "Fibonacci Number",
        "description": "The Fibonacci sequence is such that each number is the sum of the two preceding ones. Given n, calculate F(n).",
        "category": "Recursion, Algorithms",
        "difficulty": "Easy",
        "link": "https://leetcode.com/problems/fibonacci-number/"
    },
    {
        "questionId": "6",
        "title": "Implement Stack using Queues",
        "description": "Implement a LIFO stack using only two queues. Support push, pop, and other stack functions.",
        "category": "Data Structures",
        "difficulty": "Easy",
        "link": "https://leetcode.com/problems/implement-stack-using-queues/"
    },
    {
        "questionId": "7",
        "title": "Combine Two Tables",
        "description": "Given the Person and Address tables, write a solution to report the first name, last name, city, and state of each person. If a person’s address is not available, report null instead.",
        "category": "Databases",
        "difficulty": "Easy",
        "link": "https://leetcode.com/problems/combine-two-tables/"
    },
    {
        "questionId": "8",
        "title": "Repeated DNA Sequences",
        "description": "Given a string representing a DNA sequence, return all 10-letter-long sequences that occur more than once in a DNA molecule.",
        "category": "Algorithms, Bit Manipulation",
        "difficulty": "Medium",
        "link": "https://leetcode.com/problems/repeated-dna-sequences/"
    },
    {
        "questionId": "9",
        "title": "Course Schedule",
        "description": "Given numCourses and prerequisites, determine if you can finish all courses. Return true if possible, otherwise return false.",
        "category": "Data Structures, Algorithms",
        "difficulty": "Medium",
        "link": "https://leetcode.com/problems/course-schedule/"
    },
    {
        "questionId": "10",
        "title": "LRU Cache Design",
        "description": "Design and implement an LRU (Least Recently Used) cache.",
        "category": "Data Structures",
        "difficulty": "Medium",
        "link": "https://leetcode.com/problems/lru-cache/"
    },
    {
        "questionId": "11",
        "title": "Longest Common Subsequence",
        "description": "Given two strings, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
        "category": "Strings, Algorithms",
        "difficulty": "Medium",
        "link": "https://leetcode.com/problems/longest-common-subsequence/"
    },
    {
        "questionId": "12",
        "title": "Rotate Image",
        "description": "Given an n x n 2D matrix, rotate the image by 90 degrees clockwise.",
        "category": "Arrays, Algorithms",
        "difficulty": "Medium",
        "link": "https://leetcode.com/problems/rotate-image/"
    },
    {
        "questionId": "13",
        "title": "Airplane Seat Assignment Probability",
        "description": "n passengers board an airplane with n seats. The first passenger picks a seat randomly, but everyone else picks their own seat if available. Return the probability that the nth person gets their own seat.",
        "category": "Brainteaser",
        "difficulty": "Medium",
        "link": "https://leetcode.com/problems/airplane-seat-assignment-probability/"
    },
    {
        "questionId": "14",
        "title": "Validate Binary Search Tree",
        "description": "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
        "category": "Data Structures, Algorithms",
        "difficulty": "Medium",
        "link": "https://leetcode.com/problems/validate-binary-search-tree/"
    },
    {
        "questionId": "15",
        "title": "Sliding Window Maximum",
        "description": "Given an array of integers and a sliding window of size k, return the max value in the window as it moves across the array.",
        "category": "Arrays, Algorithms",
        "difficulty": "Hard",
        "link": "https://leetcode.com/problems/sliding-window-maximum/"
    },
    {
        "questionId": "16",
        "title": "N-Queen Problem",
        "description": "Given an integer n, return all distinct solutions to the n-queens puzzle where no two queens attack each other on an n x n chessboard.",
        "category": "Algorithms",
        "difficulty": "Hard",
        "link": "https://leetcode.com/problems/n-queens/"
    },
    {
        "questionId": "17",
        "title": "Serialize and Deserialize a Binary Tree",
        "description": "Design an algorithm to serialize and deserialize a binary tree.",
        "category": "Data Structures, Algorithms",
        "difficulty": "Hard",
        "link": "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/"
    },
    {
        "questionId": "18",
        "title": "Wildcard Matching",
        "description": "Given an input string and a pattern, implement wildcard pattern matching with support for '?' and '*'.",
        "category": "Strings, Algorithms",
        "difficulty": "Hard",
        "link": "https://leetcode.com/problems/wildcard-matching/"
    },
    {
        "questionId": "19",
        "title": "Chalkboard XOR Game",
        "description": "Given an array of integers, Alice and Bob take turns erasing one number from the chalkboard. Return true if Alice wins, assuming both play optimally.",
        "category": "Brainteaser",
        "difficulty": "Hard",
        "link": "https://leetcode.com/problems/chalkboard-xor-game/"
    },
    {
        "questionId": "20",
        "title": "Trips and Users",
        "description": "Write a solution to find the cancellation rate of taxi trips with unbanned users between two dates.",
        "category": "Databases",
        "difficulty": "Hard",
        "link": "https://leetcode.com/problems/trips-and-users/"
    }
]);