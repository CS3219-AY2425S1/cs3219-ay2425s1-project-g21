import React from "react";
import { useParams } from "react-router-dom";
import useQuestions from "../hooks/useQuestions";
import "./QuestionDetails.css";

const QuestionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { questions, loading, error } = useQuestions();
  const question = questions.find((q) => q.questionId === parseInt(id || "", 10));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!question) {
    return <div>Question not found</div>;
  }

  return (
    <div className="question-details">
      <h2>{question.title}</h2>
      <p>
        <strong>Difficulty:</strong> {question.difficulty}
      </p>
      <p>
        <strong>Category:</strong> {question.category}
      </p>
      <p>
        <strong>Description:</strong> {question.description}
      </p>
    </div>
  );
};

export default QuestionDetails;
