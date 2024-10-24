import React, { useState, useEffect } from "react";

function ShowAllCal() {
  const [rootEquations, setRootEquations] = useState([]);
  const [linear, setLinear] = useState([]);
  const [interpolation, setInterpolation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ฟังก์ชันสำหรับดึงข้อมูลสมการ
  const fetchRootEquations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_server_ip}:${
          import.meta.env.VITE_server_port
        }/load/rootequation/all/100`
      ); // ดึง 100 สมการ
      const data = await response.json();

      if (data.status === "pass") {
        setRootEquations(data.equations);
      } else {
        throw new Error("Failed to fetch equations");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinear = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_server_ip}:${
          import.meta.env.VITE_server_port
        }/load/linearalgebra/all/100`
      ); // ดึง 100 สมการ
      const data = await response.json();

      if (data.status === "pass") {
        setLinear(data.data);
      } else {
        throw new Error("Failed to fetch equations");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInterpolation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `${import.meta.env.VITE_server_ip}:${
          import.meta.env.VITE_server_port
        }/load/interpolation/all/100`
      ); // ดึง 100 สมการ
      const data = await response.json();

      if (data.status === "pass") {
        setInterpolation(data.data);
      } else {
        throw new Error("Failed to fetch equations");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ดึงข้อมูลเมื่อ component โหลด
  useEffect(() => {
    fetchRootEquations();
    fetchLinear();
    fetchInterpolation();
    console.log("Abc");
  }, []);

  return (
    <div className="my-10">
      <div role="tablist" className="tabs tabs-lifted">
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          className="tab"
          aria-label="Root Equation"
          defaultChecked
        />
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-6"
        >
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Equation</th>
                  </tr>
                </thead>
                <tbody>
                  {rootEquations.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.equation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tab อื่นๆ คงเดิม */}
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          className="tab"
          aria-label="Linear Algebra"
        />
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-6"
        >
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>matrix A</th>
                    <th>matrix B</th>
                  </tr>
                </thead>
                <tbody>
                  {linear.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      {console.log(item)}
                      <td>{`[${item.matA.map(
                        (row) => `[${row.map((val) => `${val}`)}]`
                      )}]`}</td>
                      <td>{`[${item.matB.map((val) => `${val}`)}]`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          className="tab"
          aria-label="Interpolation & Extrapolation"
        />
        <div
          role="tabpanel"
          className="tab-content bg-base-100 border-base-300 rounded-box p-6"
        >
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>X</th>
                    <th>fx</th>
                  </tr>
                </thead>
                <tbody>
                  {interpolation.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{`[${item.matX.map((val) => `${val}`)}]`}</td>
                      <td>{`[${item.matFX.map((val) => `${val}`)}]`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowAllCal;
