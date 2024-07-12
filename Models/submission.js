const mongoose = require('mongoose')


const SubmissionSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: [true, "School ID must be provided"]
    },
    submissionDate: {
        type: Date,
        default: Date.now()
    },
    weight: {
        type: Number,
        default: 0
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
});
const Submission = mongoose.models.SubmissionSchema || mongoose.model('Submission', SubmissionSchema);

module.exports = Submission
