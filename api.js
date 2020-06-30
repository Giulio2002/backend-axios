// Serves the DB
require('dotenv').config()
const express = require('express')
const app = express()

var knex = require('knex')({
  client: 'pg',
  connection: {
    host : process.env.DBHOST,
    user : process.env.DBUSER,
    password : process.env.DBPASSWORD,
    database : process.env.DB
  }           
})

const run = async () => {
  // Setup API
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  app.get("/", async (req, res) => {
    const records = await knex.select().table('option_data')
    res.json(records)
  })

  app.get('/id/:id', async function(req, res) {
    const record = await knex('option_data')
      .where({id: req.params.id})
      .first()
      .select()
    res.json(record)
  })
  
  app.get('/expire/:expire', async function(req, res) {
    const record = await knex('option_data')
      .where({expire: req.params.expire})
      .where({status: "Avaible"})
    res.json(record)
  })

  app.get('/search/:id/:address', async function(req, res) {
    const record = await knex('option_data')
      .where({id: req.params.id, address: req.params.address})
    res.json(record)
  })

  app.get('/past/:address', async function(req, res) {
    res.json([
      ...(await knex('option_data')
        .where({address: req.params.address, status: "Claimed"})
        .select()),
      ...(await knex('option_data')
        .where({address: req.params.address, status: "Expired"})
        .select()),
        ...(await knex('option_data')
        .where({status: "Closed", address: req.params.address})
        .select())
    ])
  })

  app.get('/present/:address', async function(req, res) {
    res.json([
      ...(await knex('option_data')
        .where({status: "Avaible", address: req.params.address})
        .select()),
      ...(await knex('option_data')
          .where({status: "Purchased", address: req.params.address})
          .select())
    ])
  })

  app.listen(4000, () => {
    console.log("Server running on port 4000")
  })
}

run()