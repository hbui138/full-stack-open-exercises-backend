const mongoose = require('mongoose')

require('dotenv').config()

const url = process.env.MONGODB_URI

mongoose.set('strictQuery', false)

//Connect to database
console.log('connecting to', url)
mongoose.connect(url).then(result => {
    console.log('connected to MongoDB')
  })
  .catch(error => {
    console.log('error connecting to MongoDB:', error.message)
  })

  
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 1
  },
  number: String
})


personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

Person = mongoose.model('Person', personSchema)

module.exports = {Person}
