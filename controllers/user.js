const { StatusCodes } = require("http-status-codes");
const User = require('../Models/user')
const Reward = require('../Models/reward')
const Submission = require('../Models/submission')
const Tips = require('../Models/notification')
const asyncWrapper = require('../middlewares/asyncWrapper')
const sendOTP = require('../services/userServices')


const getSubmissionCount = async (schoolId) => {
    return await Submission.countDocuments({ schoolId: schoolId});
};

const getRewardCount = async (schoolId) => {
    return await Reward.countDocuments({ schoolClaimed: schoolId });
};

const getTotalWeight = async (schoolId) => {
    const totalWeight = await Submission.aggregate([
        {
            $match: { schoolId: schoolId }
        },
        {
            $group: {
                _id: null,
                totalWeight: { $sum: "$weight" }
            }
        }
    ]);
    return totalWeight.length > 0 ? totalWeight[0].totalWeight : 0;
};


const viewAllRank = async () => {
    const schools = await User.find({ role: { $ne: 'admin' } })
        .select('schoolName binPoints -_id')
        .sort('-binPoints');

    // Transform the schools data to include rank
    const rankedSchools = schools.map((school, index) => ({
        rank: index + 1,
        schoolName: school.schoolName,
        binPoints: school.binPoints
    }));

    return rankedSchools;
};


const getSchoolRank = async (schoolId) => {
    const schools = await User.find({ role: { $ne: 'admin' } })
        .select('binPoints _id')
        .sort('-binPoints');

    const index = schools.findIndex(school => school._id.toString() == schoolId);
    return index + 1
 
};


const getBinPoints = async (schoolId) => {
    const points = await User.findById(schoolId).select('binPoints -_id')
    const pointsValue = points.binPoints
    return pointsValue
}


const viewSingleReward = async () => {
    let currentRewardIndex = 0
    const rewards = await Reward.find().select('rewardName rewardDescription');

    if (rewards.length === 0) {
        return "No available reward"
    }

    const reward = rewards[currentRewardIndex];
    currentRewardIndex = (currentRewardIndex + 1) % rewards.length; // Update the index to loop through rewards

    return reward;
};

const getAllSchools = async () => {
    const schools = await User.find({ role: { $ne: 'admin' } }).select('schoolName binPoints');

    if (schools.length === 0) {
        return "No registered school "
    }

    return schools;
};


const obtainReward = asyncWrapper(async (req, res) => {
    const {email} = req.body
    const userId = req.user.userId
    const isValid = await User.findOne({_id: userId}).select('email -_id')
    if(isValid != null) {
        if(isValid != email){
            return res.status(401).json({message: 'You are not eligible to get reward, Contact School Admin'})
        } else {
            sendOTP(email)
            const reward = await User.findOne({_id: userId}).select('reward -_id')
            return res.status(200).json(reward)
        }
    }

})


const userDashboard = asyncWrapper(async (req, res) => {
    const schoolId = req.user.userId;

    // Fetch user details
    const user = await User.findById(schoolId);

    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    // Fetch necessary data for the dashboard
    const [submissionCount, rewardCount, totalWeight, schoolRank, binPoints, allRank, aReward, allSchools] = await Promise.all([
        getSubmissionCount(schoolId),
        getRewardCount(schoolId),
        getTotalWeight(schoolId),
        getSchoolRank(schoolId),
        getBinPoints(schoolId),
        viewAllRank(),
        viewSingleReward(),
        getAllSchools()
    ]);

    
    res.render('userDashboard', {
        user,
        submissionCount,
        rewardCount,
        totalWeight,
        schoolRank,
        binPoints,
        allRank,
        aReward,
        allSchools,
        token: req.user.token
    });
})



module.exports = {
    userDashboard,
    obtainReward
};
