// index.js
const express = require("express");
const fs = require("fs"); // modelue อ่านไฟล์/โฟลเดอร์ เพื่อเอามา for loop ไฟล์ทุกอันใน root บลาๆ
const path = require("path");
const cors = require("cors"); // cross origin resource อนุญาติให้แค่ ip ที่กำหนดใช้งานเซิฟเวอร์เรา
// const helmet = require("helmet");
const rateLimit = require("express-rate-limit"); // กันคนยิงเว็บรัวๆ
const timeout = require("express-timeout-handler").handler;

const app = express();
const port = process.env.PORT || 3000;
const { start, disconnect } = require("./mongo");

start();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"], // อนุญาตให้ทำไรได้บ้าง
    allowedHeaders: ["Content-Type", "Authorization"],
    // credentials: true,
  })
);
// app.use(helmet());
app.use(express.json()); // เพื่ออ่านไฟล์ json / body ที่เป็น json

app.use(express.static(path.join(__dirname, "public")));

app.use(
  timeout({
    timeout: 5000,
    onTimeout: function (req, res) {
      res.status(408).json({
        status: "error",
        message: "Request timed out",
      });
    },
    onDelayedResponse: function (req, res) {
      res.status(503).json({
        status: "error",
        message: "Please try again later",
      });
    },
  })
);

app.set("trust proxy", 1); // ยืมมือคนอื่นเพื่อเข้าถึงข้อมูลบางอย่าง

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} : ${req.url}`);
  next();
}); // middle ware

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// เพิ่ม prefix "/api" สำหรับ routes ทั้งหมด
const routesPath = path.join(__dirname, "middleware");
fs.readdirSync(routesPath).forEach((folder) => {
  const routeSubPath = path.join(routesPath, folder);
  fs.readdirSync(routeSubPath).forEach((file) => {
    if (file.endsWith(".js")) {
      const route = require(path.join(routeSubPath, file));
      app.use("/api", route); // เพิ่ม prefix '/api'
    }
  });
});

// ปรับ 404 route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log("Server running...");
});

disconnect();
