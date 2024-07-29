const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();
const {Person} = require('./models/person')

require('dotenv').config()

app.use(cors())

// Middleware to parse JSON bodies and use static content
app.use(express.json());
app.use(express.static('dist'))

// Create a new Morgan token to log request body
morgan.token("body", (req) => JSON.stringify(req.body));

//Using morgan to log the request that is not post
app.use(morgan("tiny", {
  skip: (req) => req.method === "POST"
}));

//Using morgan to log the post request
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body", {
    skip: (req) => req.method !== "POST", // Only log body for POST requests
  })
);

//Method to get the full list of persons
app.get("/api/persons", (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
});

//Method to get the status of the database
app.get("/info", (request, response) => {
  var date = Date();
  Person.find({}).then(personsList => {
    personsList.length
    response.send(`Phonebook has info for ${personsList.length} people <br> ${date}`);
  })
});

//Method to get singular person info
app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id).then(result => {
    if (result) {
      response.json(result)
    }
    else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
});

//Method to delete a person from the array
app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndDelete(id).then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
});

// Method to add a new person to the array
app.post("/api/persons", async (request, response, next) => {
  const newPerson = request.body;

  // Check if the name and number are provided
  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({
      error: "Name or number missing"
    });
  }

  // Check if the name already exists
  const nameExists = await Person.findOne({name: newPerson.name});
  if (nameExists) {
    return response.status(400).json({
      error: "Name must be unique"
    });
  }

  const personObj = new Person({
    name: newPerson.name,
    number: newPerson.number,
  });


  personObj.save().then(result => {
    response.json(result)
  })
  .catch(error => next(error))
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  
  const newPerson = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, newPerson, { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))

})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
