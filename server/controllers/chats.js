const Chat = require("../models/chtasSchema");
const Conversation = require("../models/conversationSchema");
const User = require("../models/employeeModel");

// Search users by name or email
const searchUsers = async (req, res) => {
  const { query } = req.query;



  console.log("first")
  
  if(query===""){
return res.status(403).json({
  message:"Iput meddtory"
})

}
  try {
    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
      ],
    }).select("name email photoUrl");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to search users" });
  }
};

// Create or fetch conversation
const createOrFetchConversation = async (req, res) => {
  const { senderId, receiverId } = req.body;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, receiverId],
      });
      await conversation.save();
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: "Failed to create or fetch conversation" });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  const { conversationId, senderId, message } = req.body;

  try {
    const chat = new Chat({
      conversationId,
      sender: senderId,
      message,
    });

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get chat history of a conversation
const getConversationHistory = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const chats = await Chat.find({ conversationId }).populate("sender", "name");
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

module.exports = {
  searchUsers,
  createOrFetchConversation,
  sendMessage,
  getConversationHistory,
};
