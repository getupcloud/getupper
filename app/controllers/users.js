const gravatar = require('gravatar')
const Mongoose = require('mongoose')
const { version } = require('../../config/config')

const Tweet = Mongoose.model('Tweet')
const User = Mongoose.model('User')
const Analytics = Mongoose.model('Analytics')
const logger = require('../middlewares/logger')

exports.signin = (req, res) => {}

exports.authCallback = (req, res) => {
  res.redirect('/')
}

exports.login = async (req, res) => {
  const [
    analyticsCount,
    tweetCount,
    userCount
  ] = await Promise.all([
    Analytics.count(),
    Tweet.countTotalTweets(),
    User.countTotalUsers()
  ])

  logger.info(`tweetCount: ${tweetCount}`)
  logger.info(`userCount: ${userCount}`)
  logger.info(`tweetCount: ${tweetCount}`)

  return res.render('pages/login', {
    title: 'Login',
    message: req.flash('error'),
    version,
    userCount,
    tweetCount,
    analyticsCount
  })
}

exports.signupEmail = async (req, res, next) => {
  const { email, password, confirmPassword, username } = req.body

  if (password !== confirmPassword) {
    return res.redirect('/signup')
  }

  const newUser = { email, username, password, provider: 'local' }

  try {
    const gravatarImg = await gravatar.profile_url(email, { protocol: 'https', default: process.env.DEFAULT_AVATAR })

    if (gravatarImg) {
      newUser.avatar = gravatarImg.replace('.json', '').replace('secure.gravatar.com', 'secure.gravatar.com/avatar')
      console.log(gravatarImg)
    }
  } catch (error) {
    console.error(error)
  }

  const user = new User(newUser)

  return user.save()
  .catch(error => {
    return res.render('pages/login', { errors: error.errors, user: user })
  })
  .then(() => {
    return res.redirect('/')
  })
  .catch(error => {
    return next(error)
  })
}

exports.signup = (req, res) => {
  return res.render('pages/signup', {
    title: 'Sign up', user: new User()
  })
}

exports.logout = (req, res) => {
  req.logout()
  return res.redirect('/login')
}

exports.session = (req, res) => {
  return res.redirect('/')
}

exports.create = (req, res, next) => {
  const user = new User(req.body)
  user.provider = 'local'

  return user.save()
  .catch(error => {
    return res.render('pages/login', { errors: error.errors, user: user })
  })
  .then(() => {
    return req.login(user)
  })
  .then(() => {
    return res.redirect('/')
  })
  .catch(error => {
    return next(error)
  })
}

exports.list = async (req, res) => {
  const perPage = 5
  const page = (req.query.page > 0 ? req.query.page : 1) - 1

  try {
    const [
      users,
      count
    ] = await Promise.all([
      User.list({ perPage, page, criteria: {github: {$exists: true}} }),
      User.count()
    ])

    return res.render('pages/user-list', {
      title: 'List of Users',
      users: users,
      page: page + 1,
      pages: Math.ceil(count / perPage)
    })
  } catch (error) {
    return res.render('pages/500', { errors: error.errors })
  }
}

exports.show = async (req, res) => {
  try {
    const user = req.profile
    const reqUserId = user._id

    const page = (req.query.page > 0 ? req.query.page : 1) - 1
    const criteria = { user: reqUserId.toString() }

    const [
      tweets,
      tweetCount
    ] = await Promise.all([
      Tweet.list({ perPage: 100, page, criteria }),
      Tweet.countUserTweets(reqUserId)
    ])

    return res.render('pages/profile', {
      title: `Tweets from ${user.name}`,
      user,
      tweets,
      tweetCount,
      followerCount: user.following.length,
      followingCount: user.followers.length
    })
  } catch (error) {
    return res.render('pages/500', { errors: error.errors })
  }
}

exports.user = (req, res, next, id) => {
  return User.findOne({ _id: id }).exec((err, user) => {
    if (err) {
      return next(err)
    }
    if (!user) {
      return next(new Error('failed to load user ' + id))
    }
    req.profile = user
    next()
  })
}

exports.showFollowers = (req, res) => {
  return showFollowers(req, res, 'followers')
}

exports.showFollowing = (req, res) => {
  return showFollowers(req, res, 'following')
}

exports.delete = async (req, res) => {
  try {
    await Tweet.remove({ user: req.user._id })
    await User.findByIdAndRemove(req.user._id)

    return res.redirect('/login')
  } catch (error) {
    return res.render('pages/500')
  }
}

async function showFollowers(req, res, type) {
  try {
    const user = req.profile
    const followers = user[type]
    const followingCount = user.following.length
    const followerCount = user.followers.length

    const [
      tweetCount,
      users
    ] = await Promise.all([
      Tweet.countUserTweets(user._id),
      User.find({ _id: { $in: followers } }).populate('user', '_id name username github')
    ])

    return res.render('pages/followers', {
      user: user,
      followers: users,
      tweetCount: tweetCount,
      followerCount: followerCount,
      followingCount: followingCount
    })
  } catch (e) {
    return res.render('pages/500')
  }
}
