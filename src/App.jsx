import { useState } from "react";
import Headers from "./Headers";
import Hero from "./Hero";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="hero bg-secondary min-h-screen flex flex-col pl-4 pr-4 ">
        <Headers />
        <Hero />
      </div>
    </>
  );
}

export default App;
