import React, { useCallback, useState, useEffect } from "react";
import { evaluate } from "mathjs";
import Plot from "react-plotly.js";

function OnePointIteration() {
  const [formData, setFormData] = useState({
    equation: "",
    xInitial: "",
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
    const { equation, xInitial, tolerance } = formData;
    const xInitNum = parseFloat(xInitial);
    const toleranceNum = parseFloat(tolerance);

    if (equation === "" || xInitial === "" || tolerance === "")
      return "Please fill in all fields.";
    if (isNaN(xInitNum) || isNaN(toleranceNum))
      return "X initial value and tolerance(error) must be number.";

    if (toleranceNum <= 0) return "error must be greater than 0.";

    try {
      evaluate(equation, { x: 1 });
    } catch (err) {
      return "Invalid equation. Please check your input.";
    }

    return null;
  }, [formData]);

  const calOnePointIteration = useCallback(() => {
    const {
      equation,
      xInitial: xInitialString,
      tolerance: toleranceString,
    } = formData;

    let xInitial = parseFloat(xInitialString);
    let tolerance = parseFloat(toleranceString);

    const checkError = (xOld, xNew) => Math.abs((xNew - xOld) / xNew);
    const f = (x) => evaluate(equation, { x: x });

    const MAX_ITER = 50;
    let xNew = xInitial;
    let xOld = xInitial;
    let iter = 1;
    let ea = 1;
    const data = [];
    const iterations = [];
    const errors = [];

    do {
      xNew = f(xOld);
      ea = checkError(xOld, xNew);

      data.push({ iteration: iter, Xi: xNew, error: ea });
      iterations.push(iter);
      errors.push(ea);

      xOld = xNew;
      iter++;
    } while (ea > tolerance && iter <= MAX_ITER);

    setPlotData({ iterations, errors });

    return {
      root: xNew,
      data: data,
      iteration: data.length,
      xInitial: xInitial,
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
        const newResult = calOnePointIteration();

        fetch(`/api/save/rootequation/all`, {
          method: "POST",
          body: JSON.stringify({ equation: formData.equation }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        setResult(newResult);
      }
    },
    [validateInput, calOnePointIteration]
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
        <h2 className="text-white text-2xl font-bold">
          One-Point Iteration Method
        </h2>

        <div className="mt-4 w-1/3 ">
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
                    <span className="label-text">x initial</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0.1"
                    className="input input-bordered w-4/5 max-w-xs text-sm"
                    id="xInitial"
                    onChange={handleInputChange}
                  />
                </label>
                <label className="form-control w-1/2 max-w-xs">
                  <div className="label">
                    <span className="label-text">tolerance (ϵ)</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0.000001"
                    className="input input-bordered w-full max-w-xs text-sm"
                    id="tolerance"
                    onChange={handleInputChange}
                  />
                </label>
              </div>
            </div>

            {error && (
              <p className="text-red-600 text-center mt-2 w-full">{error}</p>
            )}

            <button className="btn mt-5 h-14 glass" type="submit">
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
                error : {result.error.toFixed(6)}
              </h4>
            </div>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Iteration</th>
                  <th>
                    X<sub>i</sub>
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

export default OnePointIteration;
