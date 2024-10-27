import Headers from "./Headers";
import Hero from "./Hero";
import "./App.css";
import ShowAllCal from "./ShowAllCal";
import { useState } from "react";

function App() {
  const [showCal, setShowCal] = useState(true);
  return (
    <>
      <div className="hero bg-secondary min-h-screen flex flex-col pl-4 pr-4">
        {/* <Headers /> */}
        <Hero setShowCal={setShowCal} />
        {showCal && <ShowAllCal />}
      </div>
    </>
  );
}

export default App;
