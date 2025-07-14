import React from "react";
import "./App.css";
import SnakeGame from "./SnakeGame";

// PUBLIC_INTERFACE
function App() {
  // Light theme enforced for minimalistic Snake Game
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);
  return (
    <div className="App">
      <SnakeGame />
    </div>
  );
}

export default App;
