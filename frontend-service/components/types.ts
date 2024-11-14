export interface Question {
  questionId: number;
  title: string;
  difficulty: Difficulty;
  category: string[];
  description: string;
}

export enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
}

export enum Topic {
  ALGORITHMS = "Algorithms",
  ARRAYS = "Arrays",
  BIT_MANIPULATION = "Bit Manipulation",
  BRAINTEASER = "Brainteaser",
  BFS = "Breadth-First Search",
  DATA_STRUCTURES = "Data Structures",
  DATABASES = "Databases",
  DFS = "Depth-First Search",
  DIVIDECONQUER = "Divide and Conquer",
  DP = "Dynamic Programming",
  LINKED_LIST = "Linked List",
  RECURSION = "Recursion",
  STRINGS = "Strings",
  STACK = "Stack",
  SORTING = "Sorting",
  TREE = "Tree",
  QUEUE = "Queue",
}
