const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

dotenv.config();

const PORT = parseInt(process.env.PORT, 10) || 4000;
connectDB();

app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));

app.use(helmet());
app.use(morgan("combined"));

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudinaryConnect();

// routes
app.use("/api/v1/auth", authLimiter, require("./routes/employeeRoute"));
app.use("/api/v1/image", require("./routes/imageRoute"));
app.use("/api/v1/leaves", require("./routes/leaveRoute"));
app.use("/api/v1/attendance", require("./routes/attendanceRoute"));
app.use("/api/v1/timesheets", require("./routes/timesheetRoute"));


app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ... MAHI TECHNOCRAFTS",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`);
});
