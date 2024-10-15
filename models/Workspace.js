const mongoose = require('mongoose');

let WorkspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // 같은 이름 X
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    channels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Channel'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

let Workspace = mongoose.model("Workspace", WorkspaceSchema);
module.exports = Workspace;