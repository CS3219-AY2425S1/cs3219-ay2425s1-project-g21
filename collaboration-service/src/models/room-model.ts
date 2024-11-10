export interface Room {
  roomId: string;
  code: {
    javascript: "// Start writing your JavaScript code here...";
    python: "# Start writing your Python code here...";
    java: "// Start writing your Java code here...";
    csharp: "// Start writing your C# code here...";
  };
  users: { [key: string]: boolean };
  createdAt: string;
  selectedQuestionId: number;
  status: "active" | "inactive";
  currentLanguage: "javascript" | "python" | "csharp" | "java";
}
