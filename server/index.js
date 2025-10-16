const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const path = require("path");
const cron = require("node-cron");
const socketIO = require('socket.io');
const { setIO } = require('./socketIO/socket');
const http = require('http');
const Chat = require("./models/chtasSchema")



dotenv.config();

const PORT = process.env.PORT || 8000;
connectDB();


const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
  },
});
setIO(io);

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
app.use("/api/v1/salary", require("./routes/salaryRoute"));
app.use("/api/v1/image", require("./routes/imageRoute"));
app.use("/api/v1/chat", require('./routes/chat'));
app.use("/api/v1/leave", require("./routes/leaveRoute"));
app.use("/api/v1/holiday", require("./routes/holidayRoute"));
app.use("/api/v1/rules", require("./routes/deductionRuleRoute"));
app.use("/api/v1/payroll", require("./routes/payrollRoute"));
app.use("/api/v1/payslip", require("./routes/payslipRoute"));
app.use("/api/v1/tasks", require("./routes/taskRoute"));
app.use("/api/v1/activities", require("./routes/activityRoute"));
app.use("/api/v1/timesheet", require("./routes/timesheetRoute"));
// Serve generated payslip PDFs statically
// app.use("/payslips", express.static(path.join(__dirname, "payslips")));

app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Your server is up and running ... MAHI TECHNOCRAFTS",
  });
});






io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('typing', (conversationId, userId) => {
    console.log("typing")
    socket.to(conversationId).emit('displayTyping', { userId });
  });



  socket.on('stopTyping', (conversationId, userId) => {
    socket.to(conversationId).emit('removeTyping', { userId });
  });

  socket.on('sendMessage', async (messageData) => {
    const { conversationId, sender, message } = messageData;

    if (message === "") {
      return
    }
    const newMessage = new Chat({ conversationId, sender, message });
    await newMessage.save();
    io.to(conversationId).emit('receiveMessage', {
      conversationId,
      sender,
      message,
    });

    io.emit('new_message', { conversationId, message });
  });

  socket.on('markMessagesAsRead', async ({ conversationId, userId }) => {
    try {
      // Mark unread messages as read for the current conversation
      await Chat.updateMany(
        { conversationId, sender: { $ne: userId }, read: false },
        { $set: { read: true } }
      );

      // Emit the message_read event to the conversation room
      io.to(conversationId).emit('message_read', { conversationId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
})

server.listen(PORT, () => {
  console.log(`Server is running at port no ${PORT}`)
})
