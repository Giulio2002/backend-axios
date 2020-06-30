// Update with your config settings.
require('dotenv').config()

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host : process.env.DBHOST,
      user : process.env.DBUSER,
      password : process.env.DBPASSWORD,
      database : process.env.DB
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: 'migrations',
    }
  },

  production: {
    client: 'pg',
    connection: {
      host : process.env.DBHOST,
      user : process.env.DBUSER,
      password : process.env.DBPASSWORD,
      database : process.env.DB
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: 'migrations',
    }
  }

};
