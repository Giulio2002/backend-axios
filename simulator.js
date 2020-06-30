require('dotenv').config()
const ethers = require('ethers')
const Pivot = require('./abi/NativePivot2.json')
let currentBlock

var knex = require('knex')({
  client: 'pg',
  connection: {
    host : process.env.DBHOST,
    user : process.env.DBUSER,
    password : process.env.DBPASSWORD,
    database : process.env.DB
  }           
})

const provider = new ethers.providers.JsonRpcProvider(process.env.URI)
let curr = 1;

const run = async () => {
   // Start collecting events

  const bn = await knex('blockNumber')
    .where({key: "block"})
    .first()
    .select()
  currentBlock = bn? parseInt(bn.current, 10) : parseInt(process.env.START, 10)
  if (!bn) {
    await knex('blockNumber')
      .insert({key: 'block', current: process.env.START})
  }
  for (let index = 0; index < 1000; index++) {
      await update()
  }
}

function getExp() {
  if (curr % 2 === 0)
    return "1592501820"
  if (curr % 3 === 0)
    return "1592588220"
  if (curr % 5=== 0)
    return "1592674620"
  if (curr % 7 === 0)
    return "1592761020"
  return "1592847420"

}

const update = async () => {
    const id = curr.toString()

    const owner = curr % 3 == 0? "0x008b3b2F992C0E14eDaa6E2c662Bec549CAA8df1" : "0xbfb0444E5b0e33c8CA38332533D258A6B2Bb3dE8"
    const expire = getExp()
    const origin = curr % 2 == 0? "0x008b3b2F992C0E14eDaa6E2c662Bec549CAA8df1" : "0x5aDaff4C99416E97C6c2d9eca4FC5E53547dbba8"
    const lock = "1000000000000000000"
    const until = "1592501820"
    const price_in = "5000000000000000000"
    const price_out = "50000000000000000000"
    const status = curr % 5 == 0? "Avaible": "Retired"
    await knex('option_data')
    .insert({owner, expire, id, origin, lock, until, price_in, price_out, status})
    curr++;
    console.log(curr)
}

run()