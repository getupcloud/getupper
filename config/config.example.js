const path = require('path')
const rootPath = path.normalize(__dirname + '/..')

module.exports = {
  development: {
    db: '',
    root: rootPath,
    app: {
      name: 'Getupper'
    },
    github: {
      clientID: '',
      clientSecret: '',
      callbackURL: ''
    }
  },
  test: {
    db: '',
    root: rootPath,
    app: {
      name: 'Getupper'
    },
    github: {
      clientID: '',
      clientSecret: '',
      callbackURL: ''
    }
  },
  production: {
    db: '',
    root: rootPath,
    app: {
      name: 'Getupper'
    },
    github: {
      clientID: '',
      clientSecret: '',
      callbackURL: ''
    }
  }
}
