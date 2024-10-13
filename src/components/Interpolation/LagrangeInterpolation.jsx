import React from "react";
import { useState, useEffect } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function LagrangeInterpolation() {
  const [numberOfDataPoint, setNumberOfDataPoint] = useState(2);
  const [inputNumOfDataPoint, setInputNumOfDataPoint] = useState("2");
  const [numberOfInputField, setNumberOfInputField] = useState([]);
  const [dataPoints, setDataPoints] = useState([]); // collect data each points.
  const [selectedPoints, setSelectedPoints] = useState([]); // collect status each checkboxes.
  const [xValue, setXvalue] = useState(""); // collect x value that i want to calculate
  const [errorInput, setErrorInput] = useState("");
  const [solution, setSolution] = useState("");
  const [calResult, setCalResult] = useState(null);

  const handleIncrementDataOfPoint = (event) => {
    event.preventDefault();
    const newVal = numberOfDataPoint + 1;
    setNumberOfDataPoint(newVal);
    setInputNumOfDataPoint(newVal.toString());
  };
  const handleDecrementDataOfPoint = (event) => {
    event.preventDefault();
    const newVal = Math.max(0, numberOfDataPoint - 1);
    setNumberOfDataPoint(newVal);
    setInputNumOfDataPoint(newVal.toString());
  };

  useEffect(() => {
    setNumberOfInputField(
      Array.from({ length: numberOfDataPoint }, (_, i) => i)
    );
    setDataPoints(Array(numberOfDataPoint).fill({ x: "", fx: "" }));
    setSelectedPoints(Array(numberOfDataPoint).fill(false));
  }, [numberOfDataPoint]);

  const handleNumberOfDataOfPoint = (e) => {
    const val = e.target.value;
    setInputNumOfDataPoint(val);

    if (val === "") {
      setNumberOfDataPoint(0);
    } else {
      const numVal = parseInt(val, 10);
      if (!isNaN(numVal) && numVal >= 0) {
        setNumberOfDataPoint(numVal);
      }
    }
  };

  const handleInputChange = (index, field, value) => {
    const newDataPoints = [...dataPoints];
    newDataPoints[index] = { ...newDataPoints[index], [field]: value };
    setDataPoints(newDataPoints);
  };

  const handleCheckboxChange = (index) => {
    const newSelectDataPoints = [...selectedPoints];
    newSelectDataPoints[index] = !newSelectDataPoints[index];
    setSelectedPoints(newSelectDataPoints);
  };

  const toggleAll = () => {
    const allSelected = selectedPoints.every(Boolean);
    setSelectedPoints(selectedPoints.map(() => !allSelected));
  };

  const calLagrange = function (data, x) {
    let result = 0;
    let latex = "";
    // let finalLatex = "";
    let numberOfPoints = data.length;
    let finalLTerm = ``;
    let finalNumTerm = ``;

    latex += "\\begin{align*}\n";

    for (let i = 0; i < numberOfPoints; i++) {
      let latexL = `L_{${i}} &= `;
      let latexTerm = ``;
      let term = data[i].fx;
      let L = 1;
      if (i !== numberOfDataPoint - 1) {
        finalLTerm += `L_${i}f(x_${i}) + `;
      } else {
        finalLTerm += `L_${i}f(x_${i})`;
      }
      for (let j = 0; j < numberOfPoints; j++) {
        if (j !== i) {
          L = (data[j].x - x) / (data[j].x - data[i].x);
          term = term * L;
          latexL += `\\frac{(x_${j} - x)}{(x_${j} - x)}`;
          latexTerm += `\\frac{(${data[j].x} - ${x})}{(${data[j].x} - ${data[i].x})}`;
        }
      }
      result += term;
      latex += `${latexL} = ${latexTerm} &= ${L.toFixed(6)} \\\\\n `;
      if (i !== numberOfPoints - 1) {
        finalNumTerm += `(${L})(${data[i].fx}) + `;
      } else {
        finalNumTerm += `(${L})(${data[i].fx})`;
      }

      console.log("reult+term: ", result);
    }

    // สร้างสมการสุดท้าย
    latex += `f(${x}) &= ${finalLTerm} \\\\\n`;
    latex += `&= ${finalNumTerm} \\\\\n`;
    latex += `&= ${result.toFixed(6)}\n`;
    latex += "\\end{align*}";

    return {
      pointData: data,
      X: x,
      result: result,
      latex: latex,
    };
  };

  const validateData = function (selectedData, xValue) {
    if (selectedData.length < 2) {
      throw new Error("Please select at least 2 data points.");
    }
    const numericData = selectedData.map(({ x, fx }) => ({
      x: parseFloat(x),
      fx: parseFloat(fx),
    }));

    if (numericData.some((point) => isNaN(point.x) || isNaN(point.fx))) {
      throw new Error("All selected points must have valid numeric values.");
    }

    const uniqXValues = new Set(numericData.map((point) => point.x));
    if (uniqXValues.size !== numericData.length) {
      throw new Error("Eachh x value must be unique.");
    }

    const numXValue = parseFloat(xValue);
    if (isNaN(numXValue)) {
      throw new Error("Please enter a valid number for the x value.");
    }

    return { numericData, numXValue };
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    setErrorInput("");

    try {
      const selectedData = dataPoints.filter((_, i) => selectedPoints[i]);
      const { numericData, numXValue } = validateData(selectedData, xValue);
      const result = calLagrange(numericData, numXValue);
      // update UI;
      setSolution(result.latex);
      setCalResult(result.result);
    } catch (error) {
      setErrorInput(error.message);
    }
  };

  return (
    <>
      {/* input form */}
      <div className=" mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <div className="mt-4 w-2/3">
          <p className="text-red-500 text-center mb-4">{errorInput}</p>
          <form onSubmit={handleCalculate}>
            <div className="flex justify-between ">
              <label className="form-control w-2/5 max-w-xs">
                <div className="label">
                  <span className="label-text">Number of points</span>
                </div>
                <div className="flex items-center">
                  <button
                    className="bg-red-500 rounded-full w-10 h-10 text-gray-50 text-2xl hover:bg-red-600"
                    onClick={handleDecrementDataOfPoint}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    placeholder="0"
                    className="input input-bordered w-2/5 max-w-md mx-2"
                    value={inputNumOfDataPoint}
                    onChange={handleNumberOfDataOfPoint}
                    min="0"
                  />
                  <button
                    className="bg-green-500 rounded-full w-10 h-10 text-gray-50 text-2xl hover:bg-green-600"
                    onClick={handleIncrementDataOfPoint}
                  >
                    +
                  </button>
                </div>
              </label>
              <label className="form-control w-3/5 max-w-xs">
                <div className="label">
                  <span className="label-text">X value</span>
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="0"
                    className="input input-bordered w-4/5 max-w-md mx-2"
                    value={xValue}
                    onChange={(e) => setXvalue(e.target.value)}
                  />
                  <button className="btn glass" type="submit">
                    Calculate
                  </button>
                </div>
              </label>
            </div>
            <div className="w-fit py-4 px-4 text-sm">
              <div className="flex">
                {numberOfInputField.length > 0 ? (
                  <>
                    <div className="flex flex-col gap-2 justify-around">
                      {numberOfInputField.map((_, i) => (
                        <input
                          key={i}
                          type="checkbox"
                          className="checkbox checkbox-info"
                          checked={selectedPoints[i]}
                          onChange={() => handleCheckboxChange(i)}
                        />
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 justify-around w-fit">
                      {numberOfInputField.map((_, i) => (
                        <div className="flex items-center gap-2 w-fit" key={i}>
                          <span className="w-8 text-center">{i + 1}.</span>
                          <input
                            type="number"
                            placeholder={`x${i}`}
                            className="input input-bordered h-10 w-56"
                            value={dataPoints[i].x}
                            onChange={(e) =>
                              handleInputChange(i, "x", e.target.value)
                            }
                          />
                          <input
                            type="number"
                            placeholder={`f(x${i + 1})`}
                            className="input input-bordered h-10 w-56"
                            value={dataPoints[i].fx}
                            onChange={(e) =>
                              handleInputChange(i, "fx", e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
              <button
                type="button"
                className="mt-6 bg-white rounded-md px-3 py-2 border-slate-300 border-2 hover:bg-slate-50"
                onClick={toggleAll}
              >
                Toggle all
              </button>
            </div>
          </form>
        </div>
      </div>
      {solution ? (
        <div className="my-2 flex items-center justify-center rounded-3xl py-4 px-6 bg-white w-5/5 max-w-full">
          <div className="flex flex-col items-center justify-center w-full">
            <h4 className="text-2xl py-6">Solution</h4>
            {/* แสดง solution */}
            <BlockMath math={solution} />
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default LagrangeInterpolation;
