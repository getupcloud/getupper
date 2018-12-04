const mongoose = require('mongoose')
const logger = require('../middlewares/logger')

const User = mongoose.model('User')
const Tweet = mongoose.model('Tweet')
const Analytics = mongoose.model('Analytics')
const { createPagination } = require('../../lib/utils')

exports.index = async (req, res) => {
  try {
    const perPage = 10
    const page = (req.query.page > 0 ? req.query.page : 1) - 1

    const [
      analytics,
      pageViews,
      tweetCount,
      userCount
    ] = await Promise.all([
      Analytics.list({ perPage, page }),
      Analytics.count(),
      Tweet.countTotalTweets(),
      User.countTotalUsers()
    ])

    const pagination = createPagination(req, Math.ceil(pageViews / perPage), page + 1)

    return res.render('pages/analytics', {
      title: 'List of users',
      analytics: analytics,
      pageViews: pageViews,
      userCount: userCount,
      tweetCount: tweetCount,
      pagination: pagination,
      pages: Math.ceil(pageViews / perPage)
    })
  } catch (error) {
    logger.error(error)
    return res.render('pages/500')
  }
}
