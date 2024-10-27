import { evaluate } from "mathjs";
import React, { useCallback, useState, useEffect } from "react";
import Plot from "react-plotly.js";

function Bisection() {
  const [formData, setFormData] = useState({
    equation: "",
    xl: "",
    xr: "",
    tolerance: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [plotData, setPlotData] = useState(null);

  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const validateInput = useCallback(() => {
    const { equation, xl, xr, tolerance } = formData;
    const xlNum = parseFloat(xl);
    const xrNum = parseFloat(xr);
    const toleranceNum = parseFloat(tolerance);

    if (!equation || xl === "" || xr === "" || tolerance === "")
      return "Please fill in all fields.";

    if (isNaN(xlNum) || isNaN(xrNum) || isNaN(toleranceNum))
      return "Xl, Xr and tolerance(error) must be number.";

    if (xlNum >= xrNum) return "Xl must be less than Xr.";

    if (toleranceNum <= 0) return "error must be greater than 0.";

    try {
      evaluate(equation, { x: 1 });
    } catch (err) {
      return "Invalid equation. Please check your input.";
    }

    return null;
  }, [formData]);

  const calculateBisection = useCallback(() => {
    const {
      equation,
      xl: xlString,
      xr: xrString,
      tolerance: toleranceString,
    } = formData;
    let xl = parseFloat(xlString);
    let xr = parseFloat(xrString);
    const tolerance = parseFloat(toleranceString);

    let xm,
      fXm,
      fXr,
      ea = 1;
    const MAX_ITER = 50;
    const data = [];
    const errors = [];
    const iterations = [];
    let iter = 1;
    do {
      xm = (xl + xr) / 2;
      fXr = evaluate(equation, { x: xr });
      fXm = evaluate(equation, { x: xm });

      if (fXm * fXr > 0) {
        ea = Math.abs((xm - xr) / xm);
        xr = xm;
      } else {
        ea = ea = Math.abs((xm - xl) / xm);
        xl = xm;
      }

      data.push({ iteration: iter, Xl: xl, Xm: xm, Xr: xr, error: ea });
      errors.push(ea);
      iterations.push(iter);
      iter++;
    } while (iter <= MAX_ITER && ea > tolerance);

    setPlotData({ iterations, errors });

    return {
      root: xm,
      iteration: data.length,
      data: data,
      Xl: xl,
      Xr: xr,
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
        const newResult = calculateBisection();

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
    [validateInput, calculateBisection]
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
        <h2 className="text-white text-2xl font-bold">Bisection Method</h2>

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
                    <span className="label-text">xl</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0"
                    className="input input-bordered w-4/5 max-w-xs text-sm"
                    id="xl"
                    onChange={handleInputChange}
                  />
                </label>
                <label className="form-control w-1/2 max-w-xs">
                  <div className="label">
                    <span className="label-text">xr</span>
                  </div>
                  <input
                    type="text"
                    placeholder="4"
                    className="input input-bordered w-4/5 max-w-xs text-sm"
                    id="xr"
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

      {/* Graph */}
      {plotData && (
        <div className="my-8 w-4/5 flex justify-center">
          <Plot
            data={[
              {
                x: plotData.iterations,
                y: plotData.errors,
                type: "scatter",
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
                  <th>Xl</th>
                  <th>Xr</th>
                  <th>Xm</th>
                  <th>error</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.iteration}</td>
                    <td>{row.Xl.toFixed(6)}</td>
                    <td>{row.Xr.toFixed(6)}</td>
                    <td>{row.Xm.toFixed(6)}</td>
                    <td>{row.error.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* <p className="text-red-500 text-center">
            No root found in the given interval.
          </p> */}
        </div>
      )}
    </>
  );
}

export default Bisection;
