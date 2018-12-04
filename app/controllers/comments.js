const mongoose = require('mongoose')

const utils = require('../../lib/utils')
const Activity = mongoose.model('Activity')
const logger = require('../middlewares/logger')

exports.load = async (req, res, next, id) => {
  try {
    req.comment = await utils.findByParam(req.tweet.comments, { id: id })
    next()
  } catch (error) {
    next(error)
  }
}

exports.create = async (req, res) => {
  try {
    const tweet = req.tweet
    const user = req.user

    if (!req.body.body) {
      return res.redirect('/')
    }

    await tweet.addComment(user, req.body)

    const activity = new Activity({
      activityStream: 'added a comment',
      activityKey: tweet.id,
      sender: user,
      receiver: req.tweet.user
    })

    logger.info(activity)
    await activity.save()

    return res.redirect('/')
  } catch (error) {
    logger.error(error)
    return res.render('pages/500')
  }
}

exports.destroy = async (req, res) => {
  try {
    await req.comment.remove()
    return res.send(200)
  } catch (error) {
    return res.send(400)
  }
}
