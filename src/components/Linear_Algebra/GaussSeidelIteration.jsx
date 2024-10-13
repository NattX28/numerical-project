import React, { useEffect } from "react";
import { useState } from "react";

function GaussSeidelIteration() {
  const [n, setN] = useState(3);
  const [numberOfInputN, setNumberOfInputN] = useState("3");
  const [matA, setMatA] = useState([]);
  const [matB, setMatB] = useState([]);
  const [x, setX] = useState([]);
  const [error, setError] = useState([]);
  const [tolerance, setTolerance] = useState("0.000001");
  const [calResult, setCalResult] = useState(null);

  useEffect(() => {
    setMatA(
      Array(n)
        .fill()
        .map(() => Array(n).fill(""))
    );
    setMatB(Array(n).fill(""));
  }, [n]);

  const handleMatAChange = (rowIndex, colIndex, value) => {
    const newMatA = [...matA];
    newMatA[rowIndex][colIndex] = value;
    setMatA(newMatA);
  };

  const handleMatBChange = (index, value) => {
    const newMatB = [...matB];
    newMatB[index] = value;
    setMatB(newMatB);
  };

  const handleNumberOfInputN = (e) => {
    const val = e.target.value;
    setNumberOfInputN(val);

    if (val === "") {
      setN(0);
    } else {
      const numVal = parseInt(val, 10);
      if (!isNaN(numVal) && numVal >= 0) {
        setN(numVal);
      }
    }
  };

  const handleTolerance = (e) => {
    e.preventDefault();
    const val = e.target.value;
    setTolerance(val);
  };

  const calGaussSeidelIteration = () => {
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
    };
    setX(xiNew);

    return result;
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const result = calGaussSeidelIteration();
    setCalResult(result);
  };

  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">
          Gauss-Seidel Iteration
        </h2>
        <div className="my-4">
          <form onSubmit={handleCalculate}>
            <div className="flex flex-col items-center">
              <div className="flex items-end justify-between px-12 w-4/5">
                <label className="form-control w-full max-w-xs mr-4">
                  <div className="label">
                    <span className="label-text">Matrix size ( N x N )</span>
                  </div>

                  <input
                    type="number"
                    placeholder="0"
                    value={numberOfInputN}
                    onChange={(e) => handleNumberOfInputN(e)}
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
                  value={tolerance}
                  onChange={(e) => handleTolerance(e)}
                  className="input input-bordered w-full max-w-xs"
                />
              </label>
              <div className="flex justify-between items-center mt-10">
                <div className="mx-5">
                  <h3 className="text-2xl text-center">[A]</h3>
                  <div
                    className={`mt-6 grid gap-3`}
                    style={{
                      gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`,
                    }}
                  >
                    {matA.map((row, i) =>
                      row.map((_, j) => (
                        <input
                          key={`A-${i}-${j}`}
                          type="text"
                          placeholder={`a${i + 1}${j + 1}`}
                          value={matA[i][j]}
                          onChange={(e) =>
                            handleMatAChange(i, j, e.target.value)
                          }
                          className="input input-bordered w-16 h-16 text-center"
                        />
                      ))
                    )}
                  </div>
                </div>
                <div className="mx-5">
                  <h3 className="text-2xl text-center">{"{x}"}</h3>
                  <div className="mt-6 grid grid-cols-1 gap-3">
                    {Array(n)
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
                    {matB.map((_, i) => (
                      <input
                        key={`B-${i}`}
                        type="text"
                        placeholder={`b${i + 1}`}
                        value={matB[i]}
                        onChange={(e) => handleMatBChange(i, e.target.value)}
                        className="input input-bordered w-16 h-16 text-center"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      {/* Display result table */}
      {calResult && (
        <div className="my-8 w-4/5">
          {calResult ? (
            <>
              <div className="overflow-x-auto bg-white rounded-3xl">
                {/* <div className="flex justify-around w-full">
                  <h4 className="text-center my-6 text-xl">
                    Root found : x = {result.root.toFixed(6)}
                  </h4>
                  <h4 className="text-center my-6 text-xl">
                    Iterations : {result.iteration}
                  </h4>
                  <h4 className="text-center my-6 text-xl">
                    error : {result.error}
                  </h4>
                </div> */}
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
                    {calResult.data.map((row, index) => (
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
            </>
          ) : (
            <p className="text-red-500 text-center">
              No root found in the given interval.
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default GaussSeidelIteration;
