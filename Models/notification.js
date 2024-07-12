const mongoose = require('mongoose')


const NotificationSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notificationContent: {
        type: String,
        required: [true, 'Notification content must be provided'],
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now()
    }
});


const Notification = mongoose.models.NotificationSchema || mongoose.model('Notification', NotificationSchema);

module.exports = Notification