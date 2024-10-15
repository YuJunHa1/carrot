const mongoose = require('mongoose');

let MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
      },
      directMessage: {
        type: Boolean,
        default: false
      },
      recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () { return this.directMessage; } // 1:1 대화일 경우 필수
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
});

let Message = mongoose.model("Message", MessageSchema);
module.exports = Message;