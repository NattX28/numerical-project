import React from "react";
import { useState, useCallback } from "react";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function LagrangeInterpolation() {
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

  const calLagrange = useCallback(
    (data, x) => {
      let result = 0;
      let latex = "";
      // let finalLatex = "";
      let numberOfPoints = data.length;
      let finalLTerm = ``;
      let finalNumTerm = ``;

      latex += "\\begin{align*}\n";

      for (let i = 0; i < numberOfPoints; i++) {
        let latexL = `L_{${i}} &= `;
        let latexTerm = ``;
        let term = data[i].fx;
        let L = 1;
        if (i !== numberOfPoints - 1) {
          finalLTerm += `L_${i}f(x_${i}) + `;
        } else {
          finalLTerm += `L_${i}f(x_${i})`;
        }
        for (let j = 0; j < numberOfPoints; j++) {
          if (j !== i) {
            L = (data[j].x - x) / (data[j].x - data[i].x);
            term = term * L;
            latexL += `\\frac{(x_${j} - x)}{(x_${j} - x)}`;
            latexTerm += `\\frac{(${data[j].x} - ${x})}{(${data[j].x} - ${data[i].x})}`;
          }
        }
        result += term;
        latex += `${latexL} = ${latexTerm} &= ${L.toFixed(6)} \\\\\n `;
        if (i !== numberOfPoints - 1) {
          finalNumTerm += `(${L})(${data[i].fx}) + `;
        } else {
          finalNumTerm += `(${L})(${data[i].fx})`;
        }

        console.log("reult+term: ", result);
      }

      // สร้างสมการสุดท้าย
      latex += `f(${x}) &= ${finalLTerm} \\\\\n`;
      latex += `&= ${finalNumTerm} \\\\\n`;
      latex += `&= ${result.toFixed(6)}\n`;
      latex += "\\end{align*}";

      return {
        result: result,
        latex: latex,
      };
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

      const { result, latex } = calLagrange(numericPoints, xValue);
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

      setResult({ value: result, latex });
    },
    [formData, calLagrange]
  );

  return (
    <>
      {/* input form */}
      <div className=" mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">
          Lagrange Interpolation
        </h2>
        <div className="mt-4 w-2/3">
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="flex ">
              <label className="form-control w-2/5 max-w-xs ">
                <div className="label">
                  <span className="label-text">Number of points</span>
                </div>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered w-3/5 max-w-md mx-2"
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

export default LagrangeInterpolation;
