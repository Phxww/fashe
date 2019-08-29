

const options = {
    client: 'pg',
    connection: {
      host: process.env.DATABASE_HOST ,
      user: process.env.DATABASE_LOGIN_USER ,
      password: process.env.DATABASE_LOGIN_PASS,
      database:  process.env.DATABASE_NAME
    }
  };
// const knex = require('knex')(options);

module.exports= options;