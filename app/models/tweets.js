const mongoose = require('mongoose')
const { Schema } = mongoose

const { indexof } = require('../../lib/utils')

//  Getters and Setters
const getTags = tags => tags.join(',')

const setTags = tags => tags.split(',')

// Tweet Schema
const TweetSchema = new Schema({
  body: { type: String, default: '', trim: true, maxlength: 280 },
  user: { type: Schema.ObjectId, ref: 'User' },
  comments: [
    {
      body: { type: String, default: '', maxlength: 280 },
      user: { type: Schema.ObjectId, ref: 'User' },
      commenterName: { type: String, default: '' },
      commenterPicture: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  tags: { type: [], get: getTags, set: setTags },
  favorites: [{ type: Schema.ObjectId, ref: 'User' }],
  favoriters: [{ type: Schema.ObjectId, ref: 'User' }], // same as favorites
  favoritesCount: Number,
  createdAt: { type: Date, default: Date.now }
}, {usePushEach: true})

// Pre save hook
TweetSchema.pre('save', function (next) {
  if (this.favorites) {
    this.favoritesCount = this.favorites.length
  }
  if (this.favorites) {
    this.favoriters = this.favorites
  }
  next()
})

// Validations in the schema
TweetSchema.path('body').validate(
  body => body.length > 0,
  'Tweet body cannot be blank'
)

TweetSchema.virtual('_favorites').set((user) => {
  if (this.favorites.indexOf(user._id) === -1) {
    this.favorites.push(user._id)
  } else {
    this.favorites.splice(this.favorites.indexOf(user._id), 1)
  }
})

TweetSchema.methods = {
  uploadAndSave: function () {
    return this.save()
  },
  addComment: function (user, comment) {
    this.comments.push({
      body: comment.body,
      user: user._id,
      commenterName: user.username || user.name,
      commenterPicture: user.avatar || user.github.avatar_url
    })
    return this.save()
  },

  removeComment: function (commentId) {
    const index = indexof(this.comments, { id: commentId })

    if (!index) {
      return new Error('not found')
    }

    this.comments.splice(index, 1)
    return this.save()
  }
}

TweetSchema.statics = {
  load: function (id, cb) {
    return this.findOne({ _id: id })
    .populate('user', 'name username avatar provider github')
    .populate('comments.user')
    .exec(cb)
  },
  list: function (options) {
    const criteria = options.criteria || {}
    return this.find(criteria)
    .populate('user', 'name username avatar provider github')
    .sort({ createdAt: -1 })
    .limit(options.perPage)
    .skip(options.perPage * options.page)
  },
  limitedList: function (options) {
    const criteria = options.criteria || {}
    return this.find(criteria)
    .populate('user', 'name avatar username')
    .sort({ createdAt: -1 })
    .limit(options.perPage)
    .skip(options.perPage * options.page)
  },
  userTweets: function(id, cb) {
    this.find({ user: Schema.ObjectId(id) }).toArray().exec(cb)
  },
  countUserTweets: function (id, cb) {
    return this.find({ user: id })
    .count()
    .exec(cb)
  },

  // Count the total app tweets
  countTotalTweets: function () {
    return this.find({}).count()
  }
}

mongoose.model('Tweet', TweetSchema)
