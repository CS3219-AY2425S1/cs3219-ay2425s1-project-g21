import mongoose, { Schema, Document } from "mongoose";

enum Difficulty {
  EASY = "Easy",
  MEDIUM = "Medium",
  HARD = "Hard",
}

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

interface IQuestion extends Document {
  questionId: number;
  title: string;
  description: string;
  category: Topic[];
  difficulty: Difficulty;
}

const questionSchema: Schema = new Schema({
  questionId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: [String],
    required: true,
    validate: {
      validator: (val: string[]) =>
        val.length <= 2 &&
        val.every((v) => Object.values(Topic).includes(v as Topic)),
      message: "Max 2 categories allowed, and categories must be valid topics",
    },
  },
  difficulty: {
    type: String,
    enum: Difficulty,
    required: true,
  },
});

const Question = mongoose.model<IQuestion>("Question", questionSchema);
export default Question;
