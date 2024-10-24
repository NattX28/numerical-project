import React, { useCallback, useState } from "react";
import { det } from "mathjs";
import { BlockMath } from "react-katex";

function CramerRules() {
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
        n,
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
    setError(""); // Clear error when input change
  }, []);

  const validateInput = useCallback(() => {
    const { n, matA, matB } = formData;
    if (n === "" || n < 1) return "Matrix size must be positive integer.";

    for (let i = 0; i < n; i++) {
      for (let j = n; j < n; j++) {
        if (matA[i][j] === "" || isNaN(parseFloat(matA[i][j]))) {
          return `Invalid input in matrix A at position (${i + 1},${j + 1}).`;
        }
      }
      if (matB[i] === "" || isNaN(parseFloat(matB))) {
        return `Invalid input in matrix B at position (${i + 1}).`;
      }
    }

    return null;
  }, [formData]);

  const calCramersRule = useCallback(() => {
    const { n, matA, matB } = formData;
    // แปลงค่าเป็นตัวเลขก่อนการคำนวณ
    const matrixA = matA.map((row) => row.map((val) => parseFloat(val) || 0));
    const matrixB = matB.map((val) => parseFloat(val) || 0);

    // คำนวณ detA
    const detA = det(matrixA);
    if (detA === 0) {
      setError("Determinat of matrix A is 0. Cannot calculate.");
      return;
    }

    // คำนวณดีเทอร์มิแนนต์ของ Ai
    const solutions = [];
    const detAi = [];
    for (let i = 0; i < n; i++) {
      const ai2D = matrixA.map((row) => [...row]); // คัดลอกเมทริกซ์ A

      for (let j = 0; j < n; j++) {
        ai2D[j][i] = matrixB[j]; // แทนที่คอลัมน์ i ด้วยเมทริกซ์ B
      }
      detAi.push(det(ai2D));
      solutions.push(det(ai2D) / detA); // คำนวณ det(Ai)
    }

    return {
      X: solutions,
      detA: detA,
      detAi: detAi,
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
        const newResult = calCramersRule();

        fetch(
          `${import.meta.env.VITE_server_ip}:${
            import.meta.env.VITE_server_port
          }/save/linearalgebra/all`,
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
    [validateInput, calCramersRule]
  );

  const renderLatex = () => {
    if (!result) return null;

    const detALatex = `\\text{det}(A) = ${result.detA}`;
    const detAiLatex = result.detAi
      .map((detAi, i) => `\\text{det}(A_{${i + 1}}) = ${detAi}`)
      .join("\\\\");

    const xLatex = result.detAi
      .map(
        (detAi, i) =>
          `x_{${i + 1}} = \\frac{det(A_{${
            i + 1
          }})}{det(A)} = \\frac{${detAi}}{${result.detA}} = ${result.X[
            i
          ].toFixed(4)}`
      )
      .join("\\\\");

    const solutions =
      ` \\therefore ` +
      result.X.map((x, i) => `x_{${i + 1}} = ${x.toFixed(4)}`).join(", \\ ");

    return (
      <div className="flex flex-col items-center space-y-6 p-4">
        <BlockMath math={detALatex} />
        <BlockMath math={detAiLatex} />
        <BlockMath math={xLatex} />
        <BlockMath math={solutions} />
      </div>
    );
  };

  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">Cramer's Rule</h2>
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
                    min="1"
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
                      gridTemplateColumns: `repeat(${formData.n}, minmax(0, 1fr))`,
                    }}
                  >
                    {formData.matA.map((row, i) =>
                      row.map((_, j) => (
                        <input
                          key={`A-${i}-${j}`}
                          type="text"
                          name={`A-${i}-${j}`}
                          placeholder={`a${i + 1}${j + 1}`}
                          value={formData.matA[i][j]}
                          onChange={handleInputChange}
                          className="input input-bordered w-16 h-16 text-center"
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
                          className="input input-bordered w-16 h-16 text-center "
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
                        name={`B-${i}`}
                        type="text"
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
        </div>
      </div>

      {error && <p className="text-red-600 text-center mt-2 w-full">{error}</p>}

      {result && (
        <div className="my-2 flex flex-col items-center justify-center rounded-3xl py-4 px-6 bg-white w-5/5 max-w-full">
          <h3 className="text-xl font-semibold mt-4">Solution</h3>
          {renderLatex()}
        </div>
      )}
    </>
  );
}

export default CramerRules;
