

const options = {
    client: 'pg',
    connection: {
      host: process.env.HOST ,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database:  process.env.DB
    }
  };
// const knex = require('knex')(options);

module.exports= options;