const express = require('express')
const router = express.Router()
const {userDashboard, obtainReward} = require('../controllers/user')



router.route('/user').get(userDashboard)
router.route('/claim/:rewardId').post(obtainReward)



module.exports = router