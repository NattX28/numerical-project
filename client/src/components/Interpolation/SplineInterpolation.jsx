import React, { useCallback, useState } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function SplineInterpolation() {
  const [formData, setFormData] = useState({
    numberOfPoints: 2,
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

  const calSpline = useCallback((data, x) => {
    // เรียงลำดับจุดตาม x
    const sortedData = [...data].sort((a, b) => a.x - b.x);

    // หาช่วงที่ x อยู่
    let i = 0;
    while (i < sortedData.length - 1 && x > sortedData[i + 1].x) i++;
    if (i >= sortedData.length - 1) {
      return {
        result: null,
        latex: "\\text{Error: x value is outside the interpolation range}",
      };
    }

    // คำนวณค่า linear spline
    const x0 = sortedData[i].x;
    const x1 = sortedData[i + 1].x;
    const y0 = sortedData[i].fx;
    const y1 = sortedData[i + 1].fx;

    const slope = (y1 - y0) / (x1 - x0);
    const result = y0 + slope * (x - x0);

    let latex = "\\begin{align*}\n";
    latex += `\\text{For x = ${x}, } x &\\in [${x0}, ${x1}]: \\\\\n`;
    latex += `f(x) &= f(x_${i}) + \\frac{f(x_{${i + 1}}) - f(x_${i})}{x_{${
      i + 1
    }} - x_${i}}(x - x_${i}) \\\\\n`;
    latex += `&= ${y0} + \\frac{${y1} - ${y0}}{${x1} - ${x0}}(${x} - ${x0}) \\\\\n`;
    latex += `&= ${result.toFixed(6)}\n`;
    latex += "\\end{align*}";

    return {
      result,
      latex,
    };
  }, []);

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

      // ตรวจสอบค่า x ซ้ำ
      const uniqueXValues = new Set(numericPoints.map((point) => point.x));
      if (uniqueXValues.size !== numericPoints.length) {
        setError("Each x value must be unique.");
        return;
      }

      // ตรวจสอบค่า x ที่ต้องการหา
      const xValue = parseFloat(formData.xValue);
      if (isNaN(xValue)) {
        setError("Please enter a valid number for the x value.");
        return;
      }

      const { result, latex } = calSpline(numericPoints, xValue);

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
    },
    [formData, calSpline]
  );

  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">
          Linear Spline Interpolation
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
                  className="input input-bordered w-3/5 max-w-md mx-2"
                  value={formData.numberOfPoints || ""}
                  onChange={handleNumberOfPointsChange}
                  min="2"
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

export default SplineInterpolation;
