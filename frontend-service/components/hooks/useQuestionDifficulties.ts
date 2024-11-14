import { useState } from "react";
import { Difficulty } from "../types";

const useQuestionDifficulties = () => {
  const [difficulties] = useState<Difficulty[]>([
    Difficulty.EASY,
    Difficulty.MEDIUM,
    Difficulty.HARD,
  ]);
  return { difficulties };
};

export default useQuestionDifficulties;
