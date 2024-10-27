import React, { useCallback, useState, useEffect } from "react";
import { evaluate } from "mathjs";
import Plot from "react-plotly.js";

function Graphical() {
  // initial

  const [formData, setFormData] = useState({
    equation: "",
    xStart: "",
    xStop: "",
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
    const { equation, xStart, xStop, tolerance } = formData;
    const xStartNum = parseFloat(xStart);
    const xStopNum = parseFloat(xStop);
    const toleranceNum = parseFloat(tolerance);

    if (equation === "" || xStart === "" || xStop === "" || tolerance === "")
      return "Please fill in all fields.";

    if (isNaN(xStartNum) || isNaN(xStopNum) || isNaN(toleranceNum))
      return "xStart, xStop and tolerance(error) must be number.";

    if (xStartNum >= xStopNum)
      return "x start value must be less than x stop value.";

    if (toleranceNum <= 0) return "error must be greater than 0.";

    try {
      evaluate(equation, { x: 1 });
    } catch (err) {
      return "Invalid equation. Please check your input.";
    }

    return null;
  }, [formData]);

  const calGraphical = useCallback(() => {
    const {
      equation,
      xStart: xStartNum,
      xStop: xStopNum,
      tolerance,
    } = formData;
    let xStart = parseFloat(xStartNum);
    let xStop = parseFloat(xStopNum);

    const data = [];
    const X = [];
    const Y = [];
    const MAX_ITERATIONS = 1000; // ป้องกันการวนลูปไม่รู้จบ
    const refinedStep = 0.0001;
    let iter = 0;

    for (let i = xStart; i < xStop && iter < MAX_ITERATIONS; i++) {
      iter += 1;
      const y1 = evaluate(equation, { x: i });
      const y2 = evaluate(equation, { x: i + 1 });
      const xi = y1 * y2;

      data.push({
        iteration: iter,
        X: i,
        fx: y1,
      });
      X.push(i);
      Y.push(y1);

      if (Math.abs(y1) <= tolerance) {
        // พบคำตอบที่ใกล้เคียงศูนย์
        setPlotData({ Y, X });
        return {
          data: data,
          root: i,
          iteration: iter,
          tolerance: tolerance,
        };
      }
      // เปลี่ยนช่วงจาก + -> - or - -> +
      if (xi <= 0) {
        for (let j = i; j < i + 1; j += refinedStep) {
          iter += 1;
          const yj = evaluate(equation, { x: j });
          const yjNext = evaluate(equation, { x: j + refinedStep });
          const xj = yj * yjNext;

          data.push({ iteration: iter, X: j, fx: yj });
          X.push(j);
          Y.push(yj);

          if (Math.abs(yj) <= tolerance || xj <= 0) {
            setPlotData({ Y, X });
            return {
              data: data,
              root: j,
              iteration: iter,
              tolerance: tolerance,
            };
          }
        }
      }
    }

    // อัปเดตสถานะหลังจากลูปเสร็จ
    setPlotData({ Y, X });
    return {
      root: null,
      data: data,
      iteration: iter,
      tolerance: tolerance,
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
        const newResult = calGraphical();

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
    [validateInput, calGraphical]
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
        <h2 className="text-white text-2xl font-bold">Graphical Method</h2>

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
                    <span className="label-text">X start</span>
                  </div>
                  <input
                    type="text"
                    placeholder="0"
                    className="input input-bordered w-4/5 max-w-xs text-sm"
                    id="xStart"
                    onChange={handleInputChange}
                  />
                </label>
                <label className="form-control w-1/2 max-w-xs">
                  <div className="label">
                    <span className="label-text">X end</span>
                  </div>
                  <input
                    type="text"
                    placeholder="4"
                    className="input input-bordered w-4/5 max-w-xs text-sm"
                    id="xStop"
                    onChange={handleInputChange}
                  />
                </label>
              </div>
              <label className="form-control w-full max-w-xs">
                <div className="label">
                  <span className="label-text">tolerance</span>
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
                x: plotData.X,
                y: plotData.Y,
                type: "scatter",
                mode: "lines+markers",
                marker: { color: "#6C0BA9" },
                name: "value",
              },
            ]}
            layout={{
              width: 1080,
              height: 480,
              title: "x vs f(x)",
              xaxis: { title: "x" },
              yaxis: { title: "f(x)", type: "number" },
            }}
          ></Plot>
        </div>
      )}

      {/* Display result table */}
      {result && (
        <div className="my-8 w-4/5">
          <div className="overflow-x-auto bg-white rounded-3xl ">
            <h4 className="text-center my-6 text-xl">
              Root found : x = {result.root.toFixed(6)}, Iteration :
              {result.iteration}
            </h4>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Iteration</th>
                  <th>X</th>
                  <th>Y</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.iteration}</td>
                    <td>{row.X.toFixed(6)}</td>
                    <td>{row.fx.toFixed(6)}</td>
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

export default Graphical;
