import React, { useEffect } from "react";
import { useState } from "react";
import { det, matrix } from "mathjs";

function CramerRules() {
  const [n, setN] = useState(3);
  const [numberOfInputN, setNumberOfInputN] = useState("3");
  const [matA, setMatA] = useState([]);
  const [matB, setMatB] = useState([]);
  const [x, setX] = useState([]);

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

  const calCramersRule = () => {
    // แปลงค่าเป็นตัวเลขก่อนการคำนวณ
    const matrixA = matA.map((row) => row.map((val) => parseFloat(val) || 0));
    const matrixB = matB.map((val) => parseFloat(val) || 0);

    // คำนวณ detA
    const detA = det(matrixA);
    if (detA === 0) {
      alert("ดีเทอร์มิแนนต์ของเมทริกซ์ A เป็น 0 ไม่สามารถคำนวณได้");
      return { X: Array(n).fill(0) };
    }

    // คำนวณดีเทอร์มิแนนต์ของ Ai
    const detAi = [];
    for (let i = 0; i < n; i++) {
      const ai2D = matrixA.map((row) => [...row]); // คัดลอกเมทริกซ์ A
      for (let j = 0; j < n; j++) {
        ai2D[j][i] = matrixB[j]; // แทนที่คอลัมน์ i ด้วยเมทริกซ์ B
      }
      detAi.push(det(ai2D)); // คำนวณ det(Ai)
    }

    // คำนวณคำตอบ X
    const solutions = detAi.map((detAiVal) => detAiVal / detA);

    return {
      matrixA: matA,
      matrixB: matB,
      X: solutions,
    };
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const result = calCramersRule();
    setX([...result.X]);
  };

  return (
    <>
      <div className="mb-2 flex flex-col items-center justify-center rounded-3xl py-4 px-4 bg-white w-3/5 my-4 max-w-full">
        <h2 className="text-center text-2xl font-bold mt-2">Cramer's Rule</h2>
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
      {x.length > 0 ? (
        <div className="my-2 flex items-center justify-center rounded-3xl py-4 px-6 bg-white w-5/5 max-w-full">
          <div className="flex flex-col items-center justify-center w-full">
            {x.map((result, index) => (
              <p key={index}>{`x${index + 1} = ${result}`}</p>
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export default CramerRules;
