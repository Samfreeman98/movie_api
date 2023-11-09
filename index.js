const express = require("express"),
  morgan = require("morgan"),
  // imports built in node modules for fs and path
  fs = require("fs"),
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const app = express();

app.use(bodyParser.json());

//creates a write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

let users = [
  {
    "id": 1,
    "name": "Billy",
    "favoriteMovies": [],
  },
  {
    "id": 2,
    "name": "Spencer",
    "favoriteMovies": ["Smile"],
  },
  {
    "id": 3,
    "name": "Abby",
    "favoriteMovies": ["Annabell"],
  }

];

let movies = [
  {
    "Title":"Scream 5",
    "Genre": "Slasher",
    "Director": {
      "Name":"Matt Bettinelli-Opin, Tyler Gillett",
  }

},

  {
    "Title":"The Conjuring 2",
    "Genre": "Suspense",
    "Director":{
      "Name": "James Wan",
  }

},

  {
    "Title":"Annabelle",
    "Genre": "Thriller",
    "Director": {
      "Name": "John R. Leonetti",
  }

},

  {
    "Title":"Insidious",
    "Genre": "Slasher",
    "Director": {
     "Name": "James Wan",
  }},

  {
    "Title":"IT",
    "Genre": "Suspense",
    "Director": {
     "Name": "Andy Muschietti",
  }},

  {
    "Title":"A Nightmare on Elm Street",
    "Genre": "Slasher",
    "Director": {
      "name":"Samuel Bayer",
  }},

  {
    "Title":"The Nun",
    "Genre":"Drama",
    "Director": {
     "Name": "Corin Hardy",
  }},

  {
    "Title":"The Meg",
    "Genre":"Action",
    "Director": {
    "Name":"Jon Turteltaub",
  }},

  {
    "Title":"Smile",
    "Genre":"Suspense",
    "Director": {
     "Name": "Parker Finn",
  }},

  {
    "Title":"The Curese of La Llorona",
    "Genre":"Drama",
    "Director": {
     "Name": "Michael Chaves",
  }},

  {
    "Title":"The ring",
    "Genre":"Thriller",
    "Director": {
     "Name": "Gore Verbinski",
  }},
];

//CREATE
app.post("/users", (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser); 
  } else {
    res.status(400).send("users need name")
  }
})

//UPDATE
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if (user){
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("no such user");
  }
})

//CREATE
app.post("/users/:id/:Title", (req, res) => {
  const { id, Title } = req.params;

  let user = users.find( user => user.id == id);

  if (user){
    user.favoriteMovies.push(Title);
    res.status(200).send(`${Title} has been added to user ${id}'s array`);;
  } else {
    res.status(400).send("no such user");
  }
})

//DELETE
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find( user => user.id == id);

  if (user){
    user.favoriteMovies = user.favoriteMovies.filter( title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed fron user ${id}'s array`);;
  } else {
    res.status(400).send("no such user");
  }
})

//DELETE
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;

  let user = users.find( user => user.id == id);

  if (user){
    users = users.filter( user => user.id == id);
    res.status(200).send(`user ${id} has been deleted`);;
  } else {
    res.status(400).send("no such user");
  }
})


//sets up the logger
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));
app.use(bodyParser.json());


app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

app.get("/users", (req, res) => {
  res.status(200).json(users);
});

app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find( movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("no such movie")
  }

});

app.get("/movies/director/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName);
  
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director")
  }
});

app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;
  const genre = movies.find(movie => movie.Genre === genreName);
  
  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("no such genre")
  }
});

app.get("/", (req, res) => {
  res.send("What's your favorite scary movie?");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("The movie app has loaded and is listening on port 8080");
});
