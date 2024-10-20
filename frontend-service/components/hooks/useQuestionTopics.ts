import { useEffect, useState } from "react";

const useQuestionTopics = () => {
  const [topics, setTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/questions/topics");
        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Expected an array of topics");
        }
        setTopics(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };
    fetchTopics();
  }, []);

  return { topics, error };
};

export default useQuestionTopics;

