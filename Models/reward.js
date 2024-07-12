const mongoose = require('mongoose')


const RewardSchema = new mongoose.Schema({
    rewardName: {
        type: String,
        required: [true, 'Reward name must be provided'],
        trim: true
    },
    rewardDescription: {
        type: String,
        required: [true, 'Reward description must be provided'],
        trim: true
    },
    schoolClaimed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School'
    }
});

const Reward = mongoose.models.RewardSchema || mongoose.model('Reward', RewardSchema);

module.exports = Reward
