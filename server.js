const express = require("express");
const multer = require("multer");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

const app = express();

// 🔥 FFmpeg path (IMPORTANT)
ffmpeg.setFfmpegPath("C:\\ffmpeg-git-full\\bin\\ffmpeg.exe");

// View engine
app.set("view engine", "ejs");

// Ensure folders exist
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("output")) fs.mkdirSync("output");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// 🎧 Convert route (STRONG LOFI)
app.post("/convert", upload.single("audio"), (req, res) => {
  if (!req.file) return res.send("No file uploaded");

  const inputPath = path.resolve(req.file.path);
  const outputPath = path.resolve("output/" + Date.now() + ".mp3");

  console.log("Processing:", inputPath);

  ffmpeg(inputPath)
.audioFilters(
  "asetrate=44100*0.92,aresample=44100," +   // thoda kam deep (voice natural)
  "atempo=0.92," +                           // smooth slow
  "highpass=f=100," +                        // clean noise
  "lowpass=f=3500," +                        // thoda open sound
  "equalizer=f=120:width_type=o:width=2:g=4," + // bass kam kiya (6 → 4)
  "aecho=0.6:0.7:60:0.3"                     // reverb thoda soft
)
    .on("start", (cmd) => console.log("FFmpeg:", cmd))
    .on("end", () => {
      console.log("✅ Done");

      res.download(outputPath, "lofi.mp3", (err) => {
        if (err) console.log(err);

        // cleanup
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    })
    .on("error", (err) => {
      console.log("❌ Error:", err.message);
      res.send("Error: " + err.message);
    })
    .save(outputPath);
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server running: http://localhost:3000");
});