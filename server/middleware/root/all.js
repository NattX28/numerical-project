const { Router } = require("express");
const { addDataToDatabase, loadDataFromDatabase } = require("../../mongo");
const router = Router();

router.post("/save/rootequation/all", (req, res) => {
  const { equation } = req.body;
  console.log(req.body);

  if (!equation) {
    return res.status(400).json({ status: "error", error: "Bad Request" });
  }

  if (/['"{}[]=&%#@!]/.test(equation)) {
    return res.status(400).json({ status: "Error wrong equation!" });
  }
  addDataToDatabase("RootEquation", "All", {
    equation: equation,
  });
  return res.status(200).json({ status: "pass" });
});

router.get("/load/rootequation/all/:limit?", async (req, res) => {
  const limit = parseInt(req.params.limit || 1);
  const equations = await loadDataFromDatabase("RootEquation", "All", limit);
  const newEquations = equations.map((val) => ({
    equation: val.equation,
  }));

  console.log(newEquations);
  return res.status(200).json({
    status: "pass",
    equations: newEquations,
  });
});

module.exports = router;
