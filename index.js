const express = require("express"),
  morgan = require("morgan"),
  // imports built in node modules for fs and path
  fs = require("fs"),
  path = require("path"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  mongoose = require("mongoose"),
  Models = require("./models.js"),
  Movies = Models.Movie,
  Users = Models.User;

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/myflix", { useNewUrlParser: true, useUnifiedTopology: true});

app.use(bodyParser.json());

//creates a write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

//CREATE Add a user
/* We'll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post("/users", async (req, res) => {
  await Users.findOne({ Username: req.body.Username })
  .then((user) => {
    if (user) {
      return res.status(400).send(req.body.Username + "already exists");
    } else {
      Users
      .create({ 
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      })
      .then((user) =>{res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send("Error: " + error);
  });
});

// CREATE Add a movie 
app.post("/movies", async (req, res) => {
  await Movies.findOne({ Title: req.body.Title })
  .then((Movies) => {
    if (movies) {
      return res.status(400).send(req.body.Title + "already exists");
    } else {
      Movies
      .create({ 
        Title: req.body.Title,
        Director: req.body.Director,
        Description: req.body.Description,
      })
      .then((user) =>{res.status(201).json(user) })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      })
    }
  })
  .catch((error) => {
    console.error(error);
    res.status(500).send("Error: " + error);
  });
});

//Add a movie title to a users favorite movie by username
app.post("/users/:Username/:movies/:MovieId", async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username},
    {
      $push: {FavoriteMovies: req.params.MovieID }
    },
    { new: true }) //this line makes sure the updated doc is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//UPDATE user by username
app.put("/users/:Username", async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username},
    { $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true }) //this line makes sure updated doc is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
    })
  });


//DELETE movie from user's favorite movies
app.delete("/users/:Username/movies/:MovieId", async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username},
    {
      $pull: {FavoriteMovies: req.params.MovieID },
    },
    { new: true }) //this line makes sure the updated doc is returned
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(400).send(req.params.Username + " User was not found");
      } else {
        res.json(updatedUser);
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
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
