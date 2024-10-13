import React, { useCallback, useState, useEffect } from "react";
import { evaluate } from "mathjs";
import Plot from "react-plotly.js";

function Secant() {
  const [formData, setFormData] = useState({
    equation: "",
    initialX0: "",
    initialX1: "",
    tolerance: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [plotData, setPlotData] = useState(null);

  const handleInputChange = useCallback((e) => {
    e.preventDefault();
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const validateInput = useCallback(() => {
    const { equation, initialX0, initialX1, tolerance } = formData;
    const initialX0Num = parseFloat(initialX0);
    const initialX1Num = parseFloat(initialX1);
    const toleranceNum = parseFloat(tolerance);
    if (
      equation === "" ||
      initialX0 === "" ||
      initialX1 === "" ||
      tolerance === ""
    ) {
      return "Please fill in all fields.";
    }
    if (isNaN(initialX0Num) || isNaN(initialX1Num) || isNaN(toleranceNum)) {
      return "Initial value(X0 and X1) and epsilon(error) must be number.";
    }
    if (toleranceNum <= 0) {
      return "error must be greater than 0.";
    }
    try {
      evaluate(equation, { x: 1 });
    } catch (err) {
      return "Invalid equation. Please check your input.";
    }

    return null;
  }, [formData]);

  const calSecant = useCallback(() => {
    const {
      equation,
      initialX0: initialX0String,
      initialX1: initialX1String,
      tolerance: toleranceString,
    } = formData;
    let initialX0 = parseFloat(initialX0String);
    let initialX1 = parseFloat(initialX1String);
    let tolerance = parseFloat(toleranceString);

    let xCurr = initialX0;
    let xCurrNext = initialX1;
    let xNew;
    let iter = 1;
    let ea = 1;
    let data = [];
    let iterations = [];
    let errors = [];
    const MAX_ITER = 50;

    const f = (x) => evaluate(equation, { x: x });
    const checkError = (xOld, xNew) => Math.abs((xNew - xOld) / xNew);

    do {
      xNew =
        xCurrNext -
        (f(xCurrNext) * (xCurrNext - xCurr)) / (f(xCurrNext) - f(xCurr));

      if (f(xCurrNext) - f(xCurr) === 0) {
        setError("ส่วนเป็นศูนย์ที่ x = " + xCurrNext);
        break;
      }
      ea = checkError(xCurrNext, xNew);
      data.push({ iteration: iter, Xi: xNew, error: ea });
      iterations.push(iter);
      errors.push(ea);

      xCurr = xCurrNext;
      xCurrNext = xNew;
      iter++;
    } while (ea > tolerance && iter <= MAX_ITER);

    setPlotData({ iterations, errors });

    return {
      root: xNew,
      data: data,
      iteration: data.length,
      initialX0: initialX0,
      initialX1: initialX1,
      X: xNew,
      error: ea,
    };
  }, [formData]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const validationError = validateInput();
      if (validationError) {
        setError(validationError);
        setResult(null);
        setPlotData(null);
      } else {
        setError("");
        const newResult = calSecant();
        setResult(newResult);
      }
    },
    [validateInput, calSecant]
  );

  useEffect(() => {
    setResult(null);
    setPlotData(null);
  }, [formData]);

  return (
    <>
      {/* Display equation */}
      <div className="bg-contrast glass min-w-96 h-20 px-6 flex justify-center items-center rounded-3xl my-4">
        <h2 className="text-center font-bold text-2xl text-gray-50">
          f(x) = {formData.equation}
        </h2>
      </div>
      {/* input form */}
      <div className=" mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5">
        <h2 className="text-white text-2xl font-bold">Secant Method</h2>

        <div className="mt-4 w-1/3">
          <form
            action="#"
            className=" flex justify-center flex-col"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">Enter your equation f(x)</span>
                </div>
                <input
                  type="text"
                  placeholder="43x-7"
                  className="input input-bordered w-full max-w-xs text-sm"
                  id="equation"
                  onChange={handleInputChange}
                />
              </label>
              <div className="flex">
                <label className="form-control w-1/2 max-w-xs ">
                  <div className="label">
                    <span className="label-text">
                      X<sub>0</sub>
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="0"
                    className="input input-bordered w-4/5 max-w-xs text-sm"
                    id="initialX0"
                    onChange={handleInputChange}
                  />
                </label>
                <label className="form-control w-1/2 max-w-xs">
                  <div className="label">
                    <span className="label-text">
                      X<sub>1</sub>
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="4"
                    className="input input-bordered w-4/5 max-w-xs text-sm"
                    id="initialX1"
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">tolerance (ϵ)</span>
                </div>
                <input
                  type="text"
                  placeholder="0.000001"
                  className="input input-bordered w-full text-sm"
                  id="tolerance"
                  onChange={handleInputChange}
                />
              </label>
            </div>

            {error && (
              <p className="text-red-600 text-center mt-2 w-full">{error}</p>
            )}

            <button className="btn mt-3 h-14 glass" type="submit">
              Calculate
            </button>
          </form>
        </div>
      </div>

      {plotData && (
        <div className="my-8 w-4/5 flex justify-center">
          <Plot
            data={[
              {
                x: plotData.iterations,
                y: plotData.errors,
                mode: "lines+markers",
                marker: { color: "#6C0BA9" },
                name: "Error",
              },
            ]}
            layout={{
              width: 1080,
              height: 480,
              title: "Error vs. Iteration",
              xaxis: { title: "Iteration" },
              yaxis: { title: "Error", type: "log" },
            }}
          ></Plot>
        </div>
      )}

      {/* Display result table */}
      {result && (
        <div className="my-8 w-4/5">
          <div className="overflow-x-auto bg-white rounded-3xl">
            <div className="flex justify-around w-full">
              <h4 className="text-center my-6 text-xl">
                Root found : x = {result.root.toFixed(6)}
              </h4>
              <h4 className="text-center my-6 text-xl">
                Iterations : {result.iteration}
              </h4>
              <h4 className="text-center my-6 text-xl">
                error : {result.error}
              </h4>
            </div>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Iteration</th>
                  <th>
                    X<sub>i+1</sub>
                  </th>
                  <th>error</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.iteration}</td>
                    <td>{row.Xi.toFixed(6)}</td>
                    <td>{row.error.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default Secant;
