enum Topic {
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

export interface HistoryModel {
    roomId: string;
    selectedQuestionId: number;
    questionTitle: string;
    category: Topic[];
    attemptDateTime: string;   
    attemptTimeTaken: string;
    attemptTimeStart: number;
  }
