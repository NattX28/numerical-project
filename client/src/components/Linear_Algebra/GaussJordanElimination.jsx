import React, { useState, useCallback } from "react";
import { BlockMath } from "react-katex";

function GaussJordanElimination() {
  const [formData, setFormData] = useState({
    n: 3,
    matA: Array(3)
      .fill()
      .map(() => Array(3).fill("")),
    matB: Array(3).fill(""),
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "n") {
      const n = value === "" ? "" : Math.max(1, parseInt(value, 10));
      setFormData((prev) => ({
        n: n,
        matA: Array(n)
          .fill()
          .map(() => Array(n).fill("")),
        matB: Array(n).fill(""),
      }));
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
    const { n, matA, matB } = formData;
    if (n === "" || n < 1) return "Matrix size must be positive integer";

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

  const calGaussJordan = useCallback(() => {
    const { n, matA, matB } = formData;
    const matrixA = matA.map((row) => row.map((val) => parseFloat(val, 10)));
    const matrixB = matB.map((val) => parseFloat(val, 10));
    let ratio;

    // Forward Elimination
    for (let i = 0; i < n; i++) {
      if (matrixA[i][i] === 0) {
        setError("Error : Divide by 0");
        break;
      }

      for (let j = i + 1; j < n; j++) {
        ratio = matrixA[j][i] / matrixA[i][i];
        for (let k = i; k < n; k++) {
          matrixA[j][k] -= ratio * matrixA[i][k];
        }
        matrixB[j] -= ratio * matrixB[i];
      }
    }

    // Backward Elimination
    for (let i = n - 1; i >= 0; i--) {
      for (let j = i - 1; j >= 0; j--) {
        ratio = matrixA[j][i] / matrixA[i][i];
        for (let k = i; k < n; k++) {
          matrixA[j][k] -= ratio * matrixA[i][k];
        }
        matrixB[j] -= ratio * matrixB[i];
      }
    }

    // Make the diagonal 1
    for (let i = 0; i < n; i++) {
      const diagVal = matrixA[i][i];
      if (diagVal !== 0) {
        matrixB[i] /= diagVal;
        matrixA[i][i] /= diagVal;
      } else {
        alert("Error: Division by zero in diagonal");
        return;
      }
    }

    const xi = [...matrixB];

    return {
      matrixA: matrixA,
      matrixB: matrixB,
      X: xi,
    };
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
        const newResult = calGaussJordan();

        fetch(
          `${import.meta.env.VITE_server_ip}:${
            import.meta.env.VITE_server_port
          }/api/save/linearalgebra/all`,
          {
            method: "POST",
            body: JSON.stringify({
              matA: formData.matA,
              matB: formData.matB,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setResult(newResult);
      }
    },
    [validateInput, calGaussJordan]
  );

  const renderLatex = () => {
    if (!result) return null;

    // สร้าง Matrix แรก (เมทริกซ์ต้นฉบับพร้อม b)
    const initailMatrix = formData.matA
      .map((row, i) => [...row, "|", formData.matB[i]].join(" & "))
      .join("\\\\");

    // สร้าง Matrix ผลลัพธ์ (matrixA และ matrixB ที่ผ่านการคำนวณ)
    const resultMatrix = result.matrixA
      .map((row, i) => [...row, "|", result.matrixB[i]].join(" & "))
      .join("\\\\");

    // สร้างสมการผลลัพธ์แต่ละตัว
    const solutions =
      ` \\therefore ` +
      result.X.map((x, i) => `x_{${i + 1}} = ${x.toFixed(4)}`).join(", \\ ");

    const latex = `\\begin{bmatrix}
      ${initailMatrix}
      \\end{bmatrix} \\xrightarrow{\\text{Gauss-Jordan}} \\begin{bmatrix}${resultMatrix}
      \\end{bmatrix}`;

    return (
      <div className="flex flex-col items-center space-y-6 p-4">
        <BlockMath math={latex} />
        <BlockMath math={solutions} />
      </div>
    );
  };

  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">
          Gauss Jordan Elimination
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
      {result && (
        <div className="my-2 flex flex-col items-center justify-center rounded-3xl py-4 px-6 bg-white w-5/5 max-w-full">
          <h3 className="text-xl font-semibold mt-4">Solution</h3>
          {renderLatex()}
        </div>
      )}
    </>
  );
}

export default GaussJordanElimination;
