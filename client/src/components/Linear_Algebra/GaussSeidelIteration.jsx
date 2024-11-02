import React, { useCallback, useState } from "react";

function GaussSeidelIteration() {
  const [formData, setFormData] = useState({
    n: 3,
    matA: Array(3)
      .fill()
      .map(() => Array(3).fill("")),
    matB: Array(3).fill(""),
    tolerance: "0.000001",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [x, setX] = useState([]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "n") {
      const n = value === "" ? "" : Math.max(1, parseInt(value, 10));
      setFormData((prev) => ({
        ...prev,
        n: n,
        matA: Array(n)
          .fill()
          .map(() => Array(n).fill("")),
        matB: Array(n).fill(""),
      }));
    } else if (name === "tolerance") {
      setFormData((prev) => ({ ...prev, tolerance: value }));
    } else {
      const [matrix, row, col] = name.split("-");
      setFormData((prev) => {
        const newData = { ...prev };
        if (matrix === "A") {
          newData.matA[row][col] = value;
        } else {
          newData.matB[row] = value;
        }
        return newData;
      });
    }
    setError("");
  }, []);

  const validateInput = useCallback(() => {
    const { n, matA, matB, tolerance } = formData;
    if (n === "" || n < 1) return "Matrix size must be positive integer";

    if (
      tolerance === "" ||
      isNaN(parseFloat(tolerance)) ||
      parseFloat(tolerance) <= 0
    )
      return "Tolerance must be a positive number";

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (matA[i][j] === "" || isNaN(parseFloat(matA[i][j])))
          return `Invalid input at matrix A at position A${i}${j}`;
      }
      if (matB[i] === "" || isNaN(parseFloat(matB[i])))
        return `Invalid input at matrix B at position B${i}`;
    }

    return null;
  }, [formData]);

  const calGaussSeidelIteration = useCallback(() => {
    const { n, matA, matB, tolerance } = formData;
    const matrixA = matA.map((row) => row.map((val) => parseFloat(val)));
    const matrixB = matB.map((val) => parseFloat(val));
    let xi = new Array(n).fill(0);
    let xiNew = new Array(n).fill(0);

    const MAX_ITER = 100;
    let iterInLoop = 0;
    let maxError;
    const toleranceNum = parseFloat(tolerance);

    const tempData = [];
    let objData = {};

    do {
      iterInLoop++;
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          if (j !== i) {
            sum += matrixA[i][j] * xiNew[j];
          }
          xiNew[i] = (matrixB[i] - sum) / matrixA[i][i];
        }
      }
      maxError = 0;
      for (let i = 0; i < n; i++) {
        const ea = Math.abs((xiNew[i] - xi[i]) / xiNew[i]);
        maxError = Math.max(ea, maxError);
      }

      // update x สำหรับรอบต่อไป
      xi = [...xiNew];
      objData = {
        x: xi,
        iteration: iterInLoop,
        error: maxError,
      };
      tempData.push(objData);
    } while (iterInLoop < MAX_ITER && maxError >= toleranceNum);

    if (iterInLoop >= MAX_ITER) {
      console.log("Jacobi did not converge within number of iterations.");
    }

    const result = {
      matrixA: matA,
      matrixB: matB,
      data: tempData,
      tolerance: toleranceNum,
      iteration: iterInLoop,
      error: maxError,
    };
    setX(xiNew);

    return result;
  }, [formData]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const validationError = validateInput();
      if (validationError) {
        setError(validationError);
        setResult(null);
      } else {
        setError("");
        const newResult = calGaussSeidelIteration();

        fetch(`/api/save/linearalgebra/all`, {
          method: "POST",
          body: JSON.stringify({
            matA: formData.matA,
            matB: formData.matB,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        setResult(newResult);
      }
    },
    [validateInput, calGaussSeidelIteration]
  );

  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">
          Gauss-Seidel Iteration
        </h2>
        <div className="my-4">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center">
              <div className="flex items-end justify-between px-12 w-4/5">
                <label className="form-control w-full max-w-xs mr-4">
                  <div className="label">
                    <span className="label-text">Matrix size ( N x N )</span>
                  </div>

                  <input
                    type="number"
                    name="n"
                    value={formData.n}
                    onChange={handleInputChange}
                    className="input input-bordered w-full max-w-xs"
                  />
                </label>
                <button className="btn glass" type="submit">
                  Calculate
                </button>
              </div>
              <label className="form-control w-full max-w-xs mr-4">
                <div className="label">
                  <span className="label-text">tolerance (ϵ)</span>
                </div>
                <input
                  type="text"
                  placeholder="0.000001"
                  name="tolerance"
                  value={formData.tolerance}
                  onChange={handleInputChange}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>
              <div className="flex justify-between items-center mt-10">
                <div className="mx-5">
                  <h3 className="text-2xl text-center">[A]</h3>
                  <div
                    className={`mt-6 grid gap-3`}
                    style={{
                      gridTemplateColumns: `repeat(${formData.n},minmax(0,1fr)`,
                    }}
                  >
                    {formData.matA.map((row, i) =>
                      row.map((_, j) => (
                        <input
                          key={`A-${i}-${j}`}
                          type="text"
                          name={`A-${i}-${j}`}
                          value={formData.matA[i][j]}
                          onChange={handleInputChange}
                          className="input input-bordered w-16 h-16 text-center"
                          placeholder={`a${i + 1}${j + 1}`}
                        />
                      ))
                    )}
                  </div>
                </div>
                <div className="mx-5">
                  <h3 className="text-2xl text-center">{"{x}"}</h3>
                  <div className="mt-6 grid grid-cols-1 gap-3">
                    {Array(formData.n)
                      .fill()
                      .map((_, i) => (
                        <input
                          key={`x-${i}`}
                          type="text"
                          placeholder={`x${i + 1}`}
                          className="input input-bordered w-16 h-16 text-center"
                          disabled
                        />
                      ))}
                  </div>
                </div>

                <h3 className="text-2xl text-center">=</h3>
                <div className="mx-5">
                  <h3 className="text-2xl text-center">{"{B}"}</h3>
                  <div className="mt-6 grid grid-cols-1 gap-3">
                    {formData.matB.map((_, i) => (
                      <input
                        key={`B-${i}`}
                        type="text"
                        name={`B-${i}`}
                        placeholder={`b${i + 1}`}
                        value={formData.matB[i]}
                        onChange={handleInputChange}
                        className="input input-bordered w-16 h-16 text-center"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
          {error && (
            <p className="text-red-600 text-center mt-2 w-full">{error}</p>
          )}
        </div>
      </div>

      {/* Display result table */}
      {result && (
        <div className="my-8 w-4/5">
          <div className="overflow-x-auto bg-white rounded-3xl">
            <div className="flex justify-around w-full">
              {x.map((val, index) => (
                <h4 className="text-center my-6 text-xl">
                  x<sub>{index + 1}</sub> = {val.toFixed(6)}
                </h4>
              ))}

              <h4 className="text-center my-6 text-xl">
                Iterations : {result.iteration}
              </h4>
              <h4 className="text-center my-6 text-xl">
                Max error : {result.error.toFixed(6)}
              </h4>
            </div>
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Iteration</th>
                  {x.map((_, i) => (
                    <th key={i}>
                      x<sub>{i + 1}</sub>
                    </th>
                  ))}
                  <th>error</th>
                </tr>
              </thead>
              <tbody>
                {result.data.map((row, index) => (
                  <tr key={index}>
                    <td>{row.iteration}</td>
                    {row.x.map((val, i) => (
                      <td key={`x${i + 1}-${index}`}>{val}</td>
                    ))}
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

export default GaussSeidelIteration;
