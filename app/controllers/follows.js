const mongoose = require('mongoose')

const User = mongoose.model('User')
const Activity = mongoose.model('Activity')
const logger = require('../middlewares/logger')

exports.follow = async (req, res) => {
  const currentId = req.user.id
  const id = req.url.split('/')[2]

  // push the current user in the follower list of the target user
  try {
    const user = await User.findOne({ _id: id })

    if (user.followers.indexOf(currentId) === -1) {
      user.followers.push(currentId)
    }

    await user.save()
  } catch (error) {
    logger.error(error)
  }

  // Here, we find the id of the user we want to follow
  // and add the user to the following list of the current
  // logged in user
  try {
    const user = await User.findOne({ _id: currentId })

    if (user.following.indexOf(id) === -1) {
      user.following.push(id)
    }

    await user.save()

    const activity = new Activity({
      activityStream: 'followed by',
      activityKey: user,
      sender: currentId,
      receiver: user
    })

    await activity.save()

    return res.status(201).send({})
  } catch (error) {
    logger.error(error)
    res.render('pages/500')
  }
}
