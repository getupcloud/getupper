exports.create = async (req, res) => {
  const tweet = { ...req.tweet, _favorites: req.user }

  try {
    await tweet.save()
    res.send(200)
  } catch (error) {
    return res.send(400)
  }
}

exports.destroy = async (req, res) => {
  const tweet = { ...req.tweet, _favorites: req.user }

  try {
    await tweet.save()
    res.send(200)
  } catch (error) {
    return res.send(400)
  }
}
