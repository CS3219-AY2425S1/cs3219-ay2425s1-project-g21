import { useEffect, useState } from "react";

const useQuestionDifficulties = () => {
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDifficulties = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/questions/difficulties");
        if (!response.ok) {
          throw new Error("Failed to fetch difficulties");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Expected an array of difficulties");
        }
        setDifficulties(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };
    fetchDifficulties();
  }, []);

  return { difficulties, error };
};

export default useQuestionDifficulties;
