// Listen for positions
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
const contract = new ethers.Contract(process.env.PIVOT, Pivot.abi, provider)
let interface = new ethers.utils.Interface(Pivot.abi)

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
  setInterval(update, process.env.INTERVAL)
}

const parseStatus = (action) => {
  switch (action) {
    case "0x6a6f696e00000000000000000000000000000000000000000000000000000000": return "Avaible"
    case "0x6578697400000000000000000000000000000000000000000000000000000000": return "Retired"
    case "0x6275790000000000000000000000000000000000000000000000000000000000": return "Purchased"
    case "0x636c61696d000000000000000000000000000000000000000000000000000000": return "Claimed"
    case "0x6261636b00000000000000000000000000000000000000000000000000000000": return "Expired"
  }
} 

const update = async () => {
  const filter = contract.filters.Updated()
  filter.fromBlock = currentBlock
  filter.toBlock = await provider.getBlockNumber()
  currentBlock = filter.toBlock
  await knex('blockNumber')
    .where({ key: 'block' })
    .first()
    .update({key: 'block', current: filter.toBlock.toString()})
  const logs = await provider.getLogs(filter)
  const events = logs.map((log) => interface.parseLog(log))
  await events.forEach(async (event) => {
    const id = event.values.id
    const action = event.values.action;
    const address = event.values.caller;
    const expire = (await contract.getExpire(id)).toString()
    const origin = (await contract.getOrigin(id)).toString()
    const lock = (await contract.getLock(id)).toString()
    const price_in = (await contract.getAsk(id)).toString()
    const price_out = (await contract.getStrike(id)).toString()
    const credit = (await contract.getShares(address, id)).toString()
    const status = parseStatus(action)
    const currentEntry = await knex('option_data')
      .where({id, address})
      .first()
      .select()
    if (currentEntry) {
      await knex('option_data')
        .where({ id, address })
        .first()
        .update({address, expire, id, origin, lock, price_in, price_out, status, credit, origin_lock: currentEntry.origin_lock})
      const newStat = lock !== "0"? "Avaible": "Closed";
      const entry = await knex('option_data')
      .where({id, address: origin})
      .first()
      .select()
      await knex('option_data')
      .where({ id, address:origin })
      .first()
      .update({address: origin, expire, id, origin, lock, price_in, price_out, status: newStat, credit: "0", origin_lock: entry.origin_lock})
    } else {


      if (address !== origin)
        await knex('option_data')
          .insert({address, expire, id, origin, lock, price_in, price_out, status, credit, origin_lock: credit})
      else {
        await knex('option_data')
          .insert({address: origin, expire, id, origin, lock, price_in, price_out, status, credit, origin_lock: lock})
        }
    }
  })
}

run()