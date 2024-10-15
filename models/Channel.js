const mongoose = require('mongoose');

let ChannelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

let Channel = mongoose.model("Channel", ChannelSchema);
module.exports = Channel;