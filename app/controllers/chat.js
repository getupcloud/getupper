const mongoose = require('mongoose')

const Chat = mongoose.model('Chat')
const User = mongoose.model('User')
const Activity = mongoose.model('Activity')
const logger = require('../middlewares/logger')
const { createPagination } = require('../../lib/utils')

exports.chat = async (req, res, next, id) => {
  try {
    const chat = await Chat.load(id)

    if (!chat) {
      next(new Error('Failed to load tweet' + id))
    }

    req.chat = chat
    next()
  } catch (error) {
    next(error)
  }
}

exports.index = async (req, res) => {
  try {
    // so basically this is going to be a list of all
    // chats the user had till date
    const perPage = 10
    const page = (req.query.page > 0 ? req.query.page : 1) - 1

    const [
      users,
      count
    ] = await Promise.all([
      User.list({ perPage, page, github: { $exists: true } }),
      User.count()
    ])

    return res.render('chat/index', {
      title: 'Chat User List',
      users: users,
      page: page + 1,
      pagination: createPagination(req, Math.ceil(count / perPage), page + 1),
      pages: Math.ceil(count / perPage)
    })
  } catch (error) {
    return res.render('pages/500', { errors: error.errors })
  }
}

exports.show = (req, res) => {
  return res.send(req.chat)
}

exports.getChat = async (req, res) => {
  try {
    const chats = await Chat.list({ criteria: { receiver: req.params.userid } })
    return res.render('chat/chat', { chats: chats })
  } catch (error) {
    return res.render('pages/500', { errors: error.errors })
  }
}

exports.create = async (req, res) => {
  const chat = new Chat({
    message: req.body.body,
    receiver: req.body.receiver,
    sender: req.user.id
  })

  logger.info('chat instance', chat)

  try {
    await chat.save()

    const activity = new Activity({
      activityStream: 'sent a message to',
      activityKey: chat.id,
      receiver: req.body.receiver,
      sender: req.user.id
    })

    await activity.save()

    const chats = await Chat.list({ criteria: { receiver: req.user.id } })
    return res.render('chat/chat', { chats: chats })
  } catch (error) {
    logger.error(error)
    return res.redirect(req.header('Referrer'))
  }
}
