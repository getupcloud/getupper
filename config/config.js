const path = require("path");
const rootPath = path.normalize(__dirname + "/..");

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const callbackUrl = process.env.GITHUB_CALLBACK_URL;

const mongoHost = process.env.MONGO_IP || process.env.MONGODB_HOST || 'mongodb'
const mongoPort = '27017'
const mongoUser = process.env.MONGODB_USER || process.env.MONGO_USER
const mongoPass = process.env.MONGODB_PASSWORD || process.env.MONGO_PASSWORD
const mongoDB = process.env.MONGODB_DATABASE

const productionUrl = `mongodb://${mongoUser}:${mongoPass}@${mongoHost}:${mongoPort}/${mongoDB}`

const version = process.env.GETUPPER_REVISION || '1.0.0'

module.exports = {
  version,
  development: {
    db: "mongodb://localhost/getupper",
    root: rootPath,
    app: {
      name: "Node Twitter"
    },
    github: {
      clientID: "d5cbadc356fe075ed973",
      clientSecret: "38b6e3a1ceaa3f1898b27afdeaf2f8982232abd7",
      callbackURL: "http://localhost:3000/auth/github/callback"
    }
  },
  test: {
    db: "mongodb://localhost/getupper",
    root: rootPath,
    app: {
      name: "Nodejs Express Mongoose Demo"
    },
    github: {
      clientID: "d5cbadc356fe075ed973",
      clientSecret: "38b6e3a1ceaa3f1898b27afdeaf2f8982232abd7",
      callbackURL: "http://localhost:3000/auth/github/callback"
    }
  },
  production: {
    db: productionUrl,
    root: rootPath,
    app: {
      name: "Nodejs Express Mongoose Demo"
    },
    github: {
      clientID,
      clientSecret,
      callbackUrl
    }
  }
};
