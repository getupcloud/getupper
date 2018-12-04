const mongoose = require('mongoose')

const Tweet = mongoose.model('Tweet')
const User = mongoose.model('User')
const Analytics = mongoose.model('Analytics')
const logger = require('../middlewares/logger')
const { createPagination } = require('../../lib/utils')

exports.tweet = (req, res, next, id) => {
  return Tweet.load(id, (err, tweet) => {
    if (err) {
      next(err)
    }
    if (!tweet) {
      next(new Error('Failed to load tweet' + id))
    }
    req.tweet = tweet
    next()
  })
}

exports.create = async (req, res) => {
  const tweet = new Tweet(req.body)
  tweet.user = req.user

  try {
    await tweet.uploadAndSave()
    return res.redirect('/')
  } catch (error) {
    return res.render('pages/500', { error })
  }
}

exports.update = async (req, res) => {
  const tweet = { ...req.tweet, body: req.body.tweet }

  try {
    await tweet.uploadAndSave()
    return res.redirect('/')
  } catch (error) {
    return res.render('pages/500', { error })
  }
}

exports.destroy = async (req, res) => {
  const tweet = req.tweet

  try {
    await tweet.remove()
    return res.redirect('/')
  } catch (error) {
    return res.render('pages/500')
  }
}

exports.index = async (req, res) => {
  try {
    const perPage = 10
    const page = (req.query.page > 0 ? req.query.page : 1) - 1

    const [
      tweets,
      tweetCount,
      pageViews,
      analytics
    ] = await Promise.all([
      Tweet.list({ perPage, page }),
      User.countUserTweets(req.user._id),
      Tweet.countTotalTweets(),
      Analytics.list({ perPage: 15 })
    ])

    const pagination = createPagination(req, Math.ceil(pageViews / perPage), page + 1)

    return res.render('pages/index', {
      title: 'List of Tweets',
      tweets: tweets,
      analytics: analytics,
      page: page + 1,
      tweetCount: tweetCount,
      pagination: pagination,
      followerCount: req.user.followers.length,
      followingCount: req.user.following.length,
      pages: Math.ceil(pageViews / perPage)
    })
  } catch (error) {
    logger.error(error)
    res.render('pages/500')
  }
}
