import React from "react";
import { useState, useEffect, useCallback } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function NewtonDividedDifference() {
  const [formData, setFormData] = useState({
    numberOfPoints: 2,
    xValue: "",
    points: [
      { x: "", fx: "", selected: true },
      { x: "", fx: "", selected: true },
    ],
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = useCallback((index, field, value) => {
    setFormData((prev) => {
      const newPoints = [...prev.points];
      newPoints[index] = { ...newPoints[index], [field]: value };

      // ตรวจสอบให้แน่ใจว่าค่าที่กรอกเป็นค่าว่างจะไม่ทำให้เกิด NaN
      if (value === "") {
        newPoints[index][field] = ""; // ถ้าค่าว่างให้ตั้งค่าเป็นค่าว่าง
      } else {
        newPoints[index][field] = parseFloat(value); // แปลงค่าที่กรอกเป็นตัวเลข
      }

      return { ...prev, points: newPoints };
    });
  }, []);

  const handleNumberOfPointsChange = useCallback((newValue) => {
    // แปลง newValue เป็นตัวเลขหรือใช้ 0 ถ้าค่าว่าง
    const numVal = newValue ? parseInt(newValue, 10) : 0;

    // ตรวจสอบว่า numVal เป็นตัวเลขที่ถูกต้อง (>= 2)
    if (!isNaN(numVal) && numVal >= 2) {
      setFormData((prev) => {
        const newPoints = Array.from({ length: numVal }, (_, i) => {
          return i < prev.points.length
            ? prev.points[i]
            : { x: "", fx: "", selected: true };
        });
        return { ...prev, numberOfPoints: numVal, points: newPoints };
      });
    } else if (numVal < 2) {
      // ถ้าต่ำกว่า 2 ให้ไม่ทำอะไรเลย หรือสามารถเซ็ตเป็นค่าเริ่มต้น
      setFormData((prev) => ({
        ...prev,
        numberOfPoints: numVal,
        points: [],
      }));
    }
  }, []);

  const toggleSelection = useCallback((index) => {
    setFormData((prev) => {
      const newPoints = [...prev.points];
      newPoints[index] = {
        ...newPoints[index],
        selected: !newPoints[index].selected,
      };
      return { ...prev, points: newPoints };
    });
  }, []);

  const toggleAll = useCallback(() => {
    setFormData((prev) => {
      const allSelected = prev.points.every((points) => points.selected);
      return {
        ...prev,
        points: prev.points.map((point) => ({
          ...point,
          selected: !allSelected,
        })),
      };
    });
  }, []);

  const calNewtonDividedDifference = useCallback(
    (data) => {
      const n = data.length;
      const coefficient = new Array(n).fill(0);
      const divideDiff = new Array(n).fill(0).map(() => new Array(n).fill(0));

      // เริ่มด้วยการเก็บ y (f(x))
      for (let i = 0; i < n; i++) {
        divideDiff[i][0] = data[i].fx;
      }

      //  คำนวณผลต่างแบ่งส่วน (f[x(i) - x(i-1)])
      for (let j = 1; j < n; j++) {
        for (let i = 0; i < n - j; i++) {
          divideDiff[i][j] =
            (divideDiff[i + 1][j - 1] - divideDiff[i][j - 1]) /
            (data[i + j].x - data[i].x);
        }
      }

      for (let i = 0; i < n; i++) {
        coefficient[i] = divideDiff[0][i]; // แนวนอน
      }

      // function คำนวณค่า
      function interpolation(xVal) {
        let result = coefficient[0];
        let term = 1;
        for (let i = 1; i < n; i++) {
          term = xVal - data[i - 1].x;
          result += coefficient[i] * term;
        }
        const latex = `f(${xVal}) = ` + result;
        return latex;
      }
      return interpolation;
    },
    [formData]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setError("");

      const selectedPoints = formData.points.filter((point) => point.selected);
      if (selectedPoints.length < 2) {
        setError("Please select at least 2 data points.");
        return;
      }

      const numericPoints = selectedPoints.map(({ x, fx }) => ({
        x: x === "" ? null : parseFloat(x),
        fx: fx === "" ? null : parseFloat(fx),
      }));

      if (
        numericPoints.some(
          (point) =>
            isNaN(point.x) ||
            isNaN(point.fx) ||
            point.x === null ||
            point.fx === null
        )
      ) {
        setError("All selected points must have valid numeric values.");
        return;
      }

      const uniqueXValues = new Set(numericPoints.map((point) => point.x));
      if (uniqueXValues.size !== numericPoints.length) {
        setError("Each x value must be unique.");
        return;
      }

      const xValue = parseFloat(formData.xValue);
      if (isNaN(xValue)) {
        setError("Please enter a valid number for the x value.");
        return;
      }

      const interpolation = calNewtonDividedDifference(numericPoints);
      const latex = interpolation(xValue);

      const matX = formData.points.map((val) => val.x);
      const matFX = formData.points.map((val) => val.fx);

      fetch(
        `${import.meta.env.VITE_server_ip}:${
          import.meta.env.VITE_server_port
        }/api/save/interpolation/all`,
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

      setResult({ latex });
    },
    [formData, calNewtonDividedDifference]
  );

  return (
    <>
      {/* input form */}
      <div className=" mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">
          Newton Divided-Difference
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
                  className="input input-bordered w-2/5 max-w-md mx-2"
                  value={formData.numberOfPoints || ""}
                  onChange={(e) => handleNumberOfPointsChange(e.target.value)}
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
              <div className="flex">
                <div className="flex flex-col gap-2 justify-around">
                  {formData.points.map((point, i) => (
                    <input
                      key={i}
                      type="checkbox"
                      className="checkbox checkbox-info"
                      checked={point.selected}
                      onChange={() => toggleSelection(i)}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2 justify-around w-fit">
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
                        placeholder={`f(x${i + 1})`}
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
              <button
                type="button"
                className="mt-6 bg-white rounded-md px-3 py-2 border-slate-300 border-2 hover:bg-slate-50"
                onClick={toggleAll}
              >
                Toggle all
              </button>
            </div>
          </form>
        </div>
      </div>
      {result && (
        <div className="my-2 flex items-center justify-center rounded-3xl py-4 px-6 bg-white w-5/5 max-w-full">
          <div className="flex flex-col items-center justify-center w-full">
            <h4 className="text-2xl py-6">Solution</h4>
            {/* แสดง solution */}
            <BlockMath math={result.latex} />
          </div>
        </div>
      )}
    </>
  );
}

export default NewtonDividedDifference;
