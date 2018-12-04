const mongoose = require('mongoose')
const logger = require('../middlewares/logger')

const Activity = mongoose.model('Activity')

exports.index = async (req, res) => {
  try {
    const activities = await Activity.list({})

    return res.render('pages/activity', { activities })
  } catch (error) {
    logger.error(error)
    return res.render('pages/500')
  }
}
