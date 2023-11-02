const express = require("express"),
  morgan = require("morgan"),
  // imports built in node modules for fs and path
  fs = require("fs"),
  path = require("path");

const app = express();

//creates a write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

let topHorrorMovies = [
  {
    Title: "Scream 5",
    Director: "Matt Bettinelli-Opin, Tyler Gillett",
  },

  {
    Title: "The Conjuring 2",
    Director: "James Wan",
  },

  {
    Title: "Annabelle",
    Director: "John R. Leonetti",
  },

  {
    Title: "Insidious",
    Director: "James Wan",
  },

  {
    Title: "IT",
    Director: "Andy Muschietti",
  },

  {
    Title: "A Nightmare on Elm Street",
    Director: "Samuel Bayer",
  },

  {
    Title: "The Nun",
    Director: "Corin Hardy",
  },

  {
    Title: "The Meg",
    Director: "Jon Turteltaub",
  },

  {
    Title: "Smile",
    Director: "Parker Finn",
  },

  {
    Title: "The Curese of La Llorona",
    Director: "Michael Chaves",
  },

  {
    Title: "The ring",
    Director: "Gore Verbinski",
  },
];

//sets up the logger
app.use(morgan("combined", { stream: accessLogStream }));
app.use(express.static("public"));

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

app.get("/movies/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movie => movie.director === directorName);
  
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("no such director")
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
