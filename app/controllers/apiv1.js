const mongoose = require('mongoose')

const Tweet = mongoose.model('Tweet')
const User = mongoose.model('User')

exports.tweetList = async (req, res) => {
  try {
    const perPage = 15
    const page = (req.query.page > 0 ? req.query.page : 1) - 1

    const tweets = await Tweet.limitedList({ perPage, page })

    return res.send(tweets)
  } catch (error) {
    return res.render('pages/500', { errors: error.errors })
  }
}

exports.usersList = async (req, res) => {
  try {
    const perPage = 15
    const page = (req.query.page > 0 ? req.query.page : 1) - 1

    const users = await User.list({ perPage, page })
    return res.send(users)
  } catch (error) {
    return res.render('pages/500', { errors: error.errors })
  }
}
