const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const app = express();

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

persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

//Method to get the full list of persons
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

//Method to get the status of the database
app.get("/api/info", (request, response) => {
  var date = Date();
  response.send(`Phonebook has info for ${persons.length} people <br> ${date}`);
});

//Method to get singular person info
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    console.log("x");
    response.status(404).end();
  }
});

//Method to delete a person from the array
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

// Method to add a new person to the array
app.post("/api/persons", (request, response) => {
  const newPerson = request.body;

  // Check if the name and number are provided
  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({
      error: "Name or number missing"
    });
  }

  // Check if the name already exists
  const nameExists = persons.some(person => person.name === newPerson.name);
  if (nameExists) {
    return response.status(400).json({
      error: "Name must be unique"
    });
  }

  const newId = Math.floor(Math.random() * 1000000);
  const personObj = {
    id: newId.toString(),
    name: newPerson.name,
    number: newPerson.number,
  };

  persons = persons.concat(personObj);

  response.json(personObj);
});

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
