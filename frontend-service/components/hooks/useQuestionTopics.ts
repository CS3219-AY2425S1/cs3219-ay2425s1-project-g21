import { useEffect, useState } from "react";
import { Topic } from "../types";

const useQuestionTopics = () => {
  const [enumTopics, setEnumTopics] = useState<string[]>([]);
  const [usedTopics, setUsedTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all enum topics
    try {
      const allTopics = Object.values(Topic) as string[];
      setEnumTopics(allTopics);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred while fetching enum topics");
      }
    }
  }, []);

  useEffect(() => {
    // Fetch only used topics from backend
    const fetchUsedTopics = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_QUESTION_SERVICE_API_URL
          }/api/questions/topics`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch used topics");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Expected an array of used topics");
        }
        setUsedTopics(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("An unknown error occurred while fetching used topics");
        }
      }
    };

    fetchUsedTopics();
  }, []);

  return { enumTopics, usedTopics, error };
};

export default useQuestionTopics;
