const { Router } = require("express");
const { addDataToDatabase, loadDataFromDatabase } = require("../../mongo");
const { json } = require("stream/consumers");
const router = Router();

router.post("/save/linearalgebra/all", (req, res) => {
  const { matA, matB } = req.body;
  console.log(req.body);

  if (!matA || !matB) {
    return res.status(400).json({ status: "error", error: "Bad Request" });
  }

  if (/[{}=&%#@!()]/.test(matA) || /[{}=&%#@!()]/.test(matB)) {
    return res.status(400).json({ status: "Error wrong equation!" });
  }
  addDataToDatabase("LinearAlgebra", "All", {
    matA: matA,
    matB: matB,
  });
  return res.status(200).json({ status: "pass" });
});

router.get("/load/linearalgebra/all/:limit?", async (req, res) => {
  const limit = parseInt(req.params.limit || 1);
  const data = await loadDataFromDatabase("LinearAlgebra", "All", limit);

  const newData = data.map((val) => ({
    matA: val.matA,
    matB: val.matB,
  }));

  return res.status(200).json({
    status: "pass",
    data: newData,
  });
});

module.exports = router;
