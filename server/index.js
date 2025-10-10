const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");

dotenv.config();

const PORT = process.env.PORT || 4000;
connectDB();

app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));

app.use(cookieParser());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudinaryConnect();

// routes
app.use("/api/v1/auth", require("./routes/employeeRoute"));
app.use("/api/v1/image", require("./routes/imageRoute"));


app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ... MAHI TECHNOCRAFTS",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`);
});
