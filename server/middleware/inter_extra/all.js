const { Router } = require("express");
const { addDataToDatabase, loadDataFromDatabase } = require("../../mongo");
const { json } = require("stream/consumers");
const router = Router();

router.post("/save/interpolation/all", (req, res) => {
  const { matX, matFX } = req.body;
  console.log(req.body);
  console.log(matX);
  console.log(matFX);
  if (!matX || !matFX) {
    return res.status(400).json({ status: "error", error: "Bad Request" });
  }

  if (/[{}=&%#@!()]/.test(matX) || /[{}=&%#@!()]/.test(matFX)) {
    return res.status(400).json({ status: "Error wrong equation!" });
  }
  addDataToDatabase("Interpolation", "All", {
    matX: matX,
    matFX: matFX,
  });
  return res.status(200).json({ status: "pass" });
});

router.get("/load/interpolation/all/:limit?", async (req, res) => {
  const limit = parseInt(req.params.limit || 1);
  const data = await loadDataFromDatabase("Interpolation", "All", limit);

  const newData = data.map((val) => ({
    matX: val.matX,
    matFX: val.matFX,
  }));

  return res.status(200).json({
    status: "pass",
    data: newData,
  });
});

module.exports = router;
