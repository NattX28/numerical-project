import React from "react";
import { useState, useEffect } from "react";

//// method component
// Root Equation
import Graphical from "./components/Root_Equations/Graphical";
import Bisection from "./components/Root_Equations/Bisection";
import FalsePosition from "./components/Root_Equations/FalsePosition";
import OnePointIteration from "./components/Root_Equations/OnePointIteration";
import NewtonRaphson from "./components/Root_Equations/NewtonRaphson";
import Secant from "./components/Root_Equations/Secant";

// Linear Algebra
import CramerRules from "./components/Linear_Algebra/CramerRules";
import GaussElimination from "./components/Linear_Algebra/GaussElimination";
import GaussJordanElimination from "./components/Linear_Algebra/GaussJordanElimination";
import MatrixInversion from "./components/Linear_Algebra/MatrixInversion";
import LUDecomposition from "./components/Linear_Algebra/LUDecomposition";
import Cholesky from "./components/Linear_Algebra/Cholesky";
import JacobiIteration from "./components/Linear_Algebra/JacobiIteration";
import GaussSeidelIteration from "./components/Linear_Algebra/GaussSeidelIteration";

// Interpolation
import NewtonDividedDifference from "./components/Interpolation/NewtonDividedDifference";
import LagrangeInterpolation from "./components/Interpolation/LagrangeInterpolation";

function Hero() {
  const [typeProb, setTypeProb] = useState("");
  const [sol, setSol] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("");

  const typeOfProb = [
    { label: "Root Equations", value: "Root Equations" },
    { label: "Linear Algebra", value: "Linear Algebra" },
    { label: "Interpolation", value: "Interpolation" },
    { label: "Extrapolation", value: "Extrapolation" },
    { label: "Integration", value: "Integration" },
    { label: "Differentiation", value: "Differentiation" },
  ];

  const solution = {
    "Root Equations": [
      "Graphical Methods",
      "Bisection Methods",
      "False-Position Methods",
      "One-Point Iteration Methods",
      "Newton-Raphson Methods",
      "Secant Methods",
    ],
    "Linear Algebra": [
      "Cramer's Rule",
      "Gauss Elimination",
      "Gauss-Jordan Elimination",
      "Matrix Inversion",
      "LU Decomposition Methods",
      "Cholesky Decomposition Methods",
      "Jacobi Iteration Methods",
      "Gauss-Seidel Methods",
      "Conjugate Gradient Methods",
    ],
    Interpolation: [
      "Newton divided-differences",
      "Lagrange Interpolation",
      "Spline Interpolation",
    ],
    Extrapolation: ["Simple Regression", "Multiple Regression"],
    Integration: [
      "Trapezoidal Rule",
      "Composite Trapezoidal Rule",
      "Simpson Rule",
      "Composite Simpson Rule",
    ],
    Differentiation: ["Numerical Differentiation"],
  };

  useEffect(() => {
    console.log("Type Problem:", typeProb);
    console.log("Selected Method:", selectedMethod);
  }, [typeProb, selectedMethod]);

  const handleMethodChange = (event) => {
    setSelectedMethod(event.target.value);
  };

  const renderMethodComponent = function () {
    switch (selectedMethod) {
      case "Graphical Methods":
        return <Graphical />;
      case "Bisection Methods":
        return <Bisection />;
      case "False-Position Methods":
        return <FalsePosition />;
      case "One-Point Iteration Methods":
        return <OnePointIteration />;
      case "Newton-Raphson Methods":
        return <NewtonRaphson />;
      case "Secant Methods":
        return <Secant />;
      case "Cramer's Rule":
        return <CramerRules />;
      case "Gauss Elimination":
        return <GaussElimination />;
      case "Gauss-Jordan Elimination":
        return <GaussJordanElimination />;
      case "Matrix Inversion":
        return <MatrixInversion />;
      case "LU Decomposition Methods":
        return <LUDecomposition />;
      case "Cholesky Decomposition Methods":
        return <Cholesky />;
      case "Jacobi Iteration Methods":
        return <JacobiIteration />;
      case "Gauss-Seidel Methods":
        return <GaussSeidelIteration />;
      case "Newton divided-differences":
        return <NewtonDividedDifference />;
      case "Lagrange Interpolation":
        return <LagrangeInterpolation />;
      default:
        return null;
    }
  };

  function handleType(event) {
    const selectedType = event.target.value;
    setTypeProb(selectedType);
    setSol(solution[selectedType] || []);
    setSelectedMethod("");
  }

  return (
    <>
      <div className="hero w-full mt-4 text-4xl font-bold flex flex-col bg-primary rounded-3xl">
        <h1 className="text-black mt-8">Numerical Methods Calculator</h1>
        <div className="card flex-row min-w-full justify-center ">
          <select
            className="select select-bordered w-full max-w-xs m-4 mt-8"
            name="problemType"
            id="problemType"
            onChange={handleType}
            value={typeProb}
          >
            <option>Select type of problem</option>
            {typeOfProb.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="select select-bordered w-full max-w-xs m-4 mt-8"
            name="solutionMethod"
            id="solutionMethod"
            disabled={sol.length === 0}
            onChange={handleMethodChange}
            value={selectedMethod}
          >
            <option disabled selected value="">
              choose method
            </option>
            {sol.map((s, i) => (
              <option key={i} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>
      {renderMethodComponent()}
    </>
  );
}

export default Hero;
