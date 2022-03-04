const mongoose = require('mongoose')

const portaDB = 27017
const bancoNome = 'getapet'

async function main() {
    await mongoose.connect(`mongodb://localhost:${portaDB}/${bancoNome}`)
}

main().catch((err)=> console.log(err))

module.exports = mongoose