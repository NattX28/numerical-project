import React, { useCallback, useState } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function SimpleRegression() {
  const [formData, setFormData] = useState({
    numberOfPoints: 2,
    mOrder: 1,
    points: [
      { x: "", fx: "" },
      { x: "", fx: "" },
    ],
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const newPoints = [...prev.points];
      newPoints[index] = { ...newPoints[index], [field]: value };

      if (value === "") {
        newPoints[index][field] = "";
      } else {
        newPoints[index][field] = parseFloat(value);
      }

      return { ...prev, points: newPoints };
    });
  }, []);

  const handleNumberOfPointsChange = useCallback((e) => {
    const value = e.target.value;

    // ถ้าเป็นค่าว่าง (ผู้ใช้ลบตัวเลขออกหมด)
    if (value === "") {
      setFormData((prev) => ({
        ...prev,
        numberOfPoints: 0,

        points: [],
      }));
      return;
    }

    const numVal = parseInt(value, 10);

    // ตรวจสอบว่าเป็นตัวเลขที่ถูกต้อง
    if (!isNaN(numVal)) {
      if (numVal >= 2) {
        setFormData((prev) => {
          const newPoints = Array.from({ length: numVal }, (_, i) => {
            return i < prev.points.length ? prev.points[i] : { x: "", fx: "" };
          });
          return {
            ...prev,
            numberOfPoints: numVal,
            points: newPoints,
          };
        });
      } else {
        // ถ้าน้อยกว่า 2 ให้เก็บค่าไว้แต่ไม่แสดงช่องกรอกข้อมูล
        setFormData((prev) => ({
          ...prev,
          numberOfPoints: numVal,
          points: [],
        }));
      }
    }
  }, []);

  const handleMOrderChange = useCallback((e) => {
    const value = e.target.value;
    if (value === "") {
      setFormData((prev) => ({ ...prev, mOrder: "" }));
      return;
    }

    const numVal = parseInt(value, 10);
    if (!isNaN(numVal) && numVal >= 1) {
      setFormData((prev) => ({ ...prev, mOrder: numVal }));
    }
  }, []);

  const gaussianElimination = useCallback((matrix, vector) => {
    const n = matrix.length;
    const augmentedMatrix = matrix.map((row, i) => [...row, vector[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (
          Math.abs(augmentedMatrix[j][i]) > Math.abs(augmentedMatrix[maxRow][i])
        ) {
          maxRow = j;
        }
      }

      [augmentedMatrix[i], augmentedMatrix[maxRow]] = [
        augmentedMatrix[maxRow],
        augmentedMatrix[i],
      ];

      for (let j = i + 1; j < n; j++) {
        const factor = augmentedMatrix[j][i] / augmentedMatrix[i][i];
        for (let k = i; k <= n; k++) {
          augmentedMatrix[j][k] -= factor * augmentedMatrix[i][k];
        }
      }
    }

    // Back substitution
    const solution = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let sum = augmentedMatrix[i][n];
      for (let j = i + 1; j < n; j++) {
        sum -= augmentedMatrix[i][j] * solution[j];
      }
      solution[i] = sum / augmentedMatrix[i][i];
    }

    return solution;
  }, []);

  const calSimpleRegression = useCallback(
    (data, x, m) => {
      const points = data.map((point) => ({
        x: parseFloat(point.x),
        y: parseFloat(point.fx),
      }));

      const n = points.length;
      const len = m + 1;
      const matA = Array(len)
        .fill(0)
        .map(() => Array(len).fill(0));
      const matB = Array(len).fill(0);

      // Build matrices
      for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
          if (j === 0 && i === 0) {
            matA[i][j] = n;
          } else {
            matA[i][j] = points.reduce(
              (sum, point) => sum + Math.pow(point.x, i + j),
              0
            );
          }
        }
        matB[i] = points.reduce(
          (sum, point) => sum + point.y * Math.pow(point.x, i),
          0
        );
      }

      // Solve system equations
      const coefficients = gaussianElimination(matA, matB);

      // calulate result for given x
      let result = 0;
      for (let i = 0; i < coefficients.length; i++) {
        result += coefficients[i] * Math.pow(x, i);
      }

      // Latex
      let equation = coefficients
        .map((coef, index) => {
          if (index === 0) return coef.toFixed(6);
          if (index === 1) return `${coef >= 0 ? "+" : ""}${coef.toFixed(6)}x`;
          return `${coef >= 0 ? "+" : ""}${coef.toFixed(6)}x^{${index}}`;
        })
        .join("");

      let latex = "\\begin{align*}\n";
      latex += `f(x) &= ${equation} \\\\\n`;
      latex += `f(${x}) &= ${result.toFixed(6)}\n`;
      latex += "\\end{align*}";

      return {
        result,
        latex,
        coefficients,
      };
    },
    [gaussianElimination]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setError("");

      if (formData.points.length < 2) {
        setError("Please enter at least 2 points.");
        return;
      }

      const numericPoints = formData.points.map(({ x, fx }) => ({
        x: x === "" ? null : parseFloat(x),
        fx: fx === "" ? null : parseFloat(fx),
      }));

      // ตรวจสอบความถูกต้องของข้อมูล
      if (
        numericPoints.some(
          (point) =>
            isNaN(point.x) ||
            isNaN(point.fx) ||
            point.x === null ||
            point.fx === null
        )
      ) {
        setError("All points must have valid numeric values.");
        return;
      }

      // ตรวจสอบค่า x ที่ต้องการหา
      const xValue = parseFloat(formData.xValue);
      if (isNaN(xValue)) {
        setError("Please enter a valid number for the x value.");
        return;
      }

      if (isNaN(formData.mOrder) || formData.mOrder < 1) {
        setError("Please enter a valid order (minimum 1).");
        return;
      }

      try {
        const { result, latex } = calSimpleRegression(
          numericPoints,
          xValue,
          formData.mOrder
        );
        const matX = formData.points.map((val) => val.x);
        const matFX = formData.points.map((val) => val.fx);

        fetch(
          `${import.meta.env.VITE_server_ip}:${
            import.meta.env.VITE_server_port
          }/save/interpolation/all`,
          {
            method: "POST",
            body: JSON.stringify({
              matX: matX,
              matFX: matFX,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setResult({ value: result, latex });
      } catch (err) {
        setError("Error in calculation. Please check your input values.");
      }
    },
    [formData, calSimpleRegression]
  );

  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">
          Linear & Polynomial Regression
        </h2>
        <div className="mt-4 w-2/3">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="flex ">
              <label className="form-control w-2/5 max-w-xs">
                <div className="label">
                  <span className="label-text">Number of points</span>
                </div>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered w-4/5 max-w-md mx-2"
                  value={formData.numberOfPoints || ""}
                  onChange={handleNumberOfPointsChange}
                  min="2"
                />
              </label>
              <label className="form-control w-2/5 max-w-xs">
                <div className="label">
                  <span className="label-text">Order (m)</span>
                </div>
                <input
                  type="number"
                  placeholder="1"
                  className="input input-bordered w-4/5 max-w-md mx-2"
                  value={formData.mOrder || ""}
                  onChange={handleMOrderChange}
                  min="1"
                />
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
                    value={formData.xValue}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        xValue: e.target.value,
                      }))
                    }
                  />
                  <button className="btn glass" type="submit">
                    Calculate
                  </button>
                </div>
              </label>
            </div>
            <div className="w-fit py-4 px-4 text-sm">
              <div className="flex flex-col gap-2">
                {formData.points.map((point, i) => (
                  <div className="flex items-center gap-2 w-fit" key={i}>
                    <span className="w-8 text-center">{i + 1}.</span>
                    <input
                      type="number"
                      placeholder={`x${i}`}
                      className="input input-bordered h-10 w-56"
                      value={point.x}
                      onChange={(e) =>
                        handleInputChange(i, "x", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder={`f(x${i})`}
                      className="input input-bordered h-10 w-56"
                      value={point.fx}
                      onChange={(e) =>
                        handleInputChange(i, "fx", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
      {result && (
        <div className="my-2 flex items-center justify-center rounded-3xl py-4 px-6 bg-white w-5/5 max-w-full">
          <div className="flex flex-col items-center justify-center w-full">
            <h4 className="text-2xl py-6">Solution</h4>
            <BlockMath math={result.latex} />
          </div>
        </div>
      )}
    </>
  );
}

export default SimpleRegression;
