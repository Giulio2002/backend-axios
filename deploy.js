const ethers = require('ethers')
const Pivot = require('./abi/NativePivot2.json')
const DaiMock = require('./abi/DaiMock.json')
require('dotenv').config()
// Connect to the network
let provider = new ethers.providers.JsonRpcProvider(process.env.URI)
let privateKey = process.env.ETH_KEY
let wallet = new ethers.Wallet(privateKey, provider)

const every = 1

const main = async () => {
    // token
    let factory_t = new ethers.ContractFactory(DaiMock.abi, DaiMock.bytecode, wallet)
    let contract_t = await factory_t.deploy()
    await contract_t.deployed()
    console.log("Token Address: " + contract_t.address)
    // Pivot
    let factory_p = new ethers.ContractFactory(Pivot.abi, Pivot.bytecode, wallet)
    let contract_p = await factory_p.deploy(contract_t.address, every, every, every, every, every)
    console.log("Pivot Address: " + contract_p.address)
    await contract_p.deployed()
    const number = await provider.getBlockNumber()
    console.log("Block Number: " + number)
}
main()