// Remove unhealthy positions
require('dotenv').config()
const ethers = require('ethers')
const Pivot = require('./abi/NativePivot2.json')

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
let wallet = new ethers.Wallet(process.env.ETH_KEY, provider)
const contract = new ethers.Contract(process.env.PIVOT, Pivot.abi, wallet)


const update = async () => {
  const records = await knex.select().table('option_data')
  console.log(records)
  await records.forEach(async (record) => {
    const id = record.id
    const expire = parseInt(record.expire, 10)
    const number = await provider.getBlockNumber()
    const block = await provider.getBlock(number)
    const timestamp = block.timestamp
    if (timestamp > expire) {
      await contract.back(id, {gasLimit: 300000})
    } 
  })
}

setInterval(update, process.env.INTERVAL * 2)