import React from "react";
import QuestionList from "../../components/question/QuestionList";

interface QuestionPageProps {
  userIsAdmin: boolean;
}

const QuestionPage: React.FC<QuestionPageProps> = ({ userIsAdmin }) => {
  return (
    <div>
      <QuestionList userIsAdmin={userIsAdmin} />
    </div>
  );
};

export default QuestionPage;
