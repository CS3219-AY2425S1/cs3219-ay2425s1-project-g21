import React from 'react';
import signupGraphic from './assets/images/signup_graphic.png';// assuming you have a graphic for the homepage

const Home: React.FC = () => {

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-content">
          <h1>Welcome to Our Platform</h1>
          <p>Your one-stop destination for unlimited practice questions and skill enhancement!</p>
        </div>
        <div className="home-graphic">
          <img src={signupGraphic} alt="Homepage graphic" />
        </div>
      </div>
    </div>
  );
};

export default Home;
