const mongoose = require("mongoose");
const express = require("express");
const app = express();
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;


const { check, validationResult } = require("express-validator");

mongoose.connect(process.env.CONNECTION_URI);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require("cors");
let allowedOrigins = ["http://localhost:7351", "https://sam-movie-app-ecbcfb55535d.herokuapp.com/"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      //If a specific origin isn't found on the list of allowed origins
      let message = "The CORS policy for this application doesn't allow access from origin" + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));


app.use(morgan("combined"));

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

//creates a write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
  flags: "a",
});

app.get('/', (req, res) => {
  res.send("Welcome to my movie app!");
});

//CREATE Add a user
/* We'll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String
}*/
app.post("/users",
  //Validation logic here for request
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email is not valid').isEmail()
  ], async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

// CREATE Add a movie 
app.post("/movies", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Movies.findOne({ Title: req.body.Title })
    .then((movies) => {
      if (movies) {
        return res.status(400).send(req.body.Title + "already exists");
      } else {
        Movies
          .create({
            Title: req.body.Title,
            Director: req.body.Director,
            Description: req.body.Description,
          })
          .then((user) => { res.status(201).json(user) })
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
app.post("/users/:Username/movies/:MovieId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {
      $push: { FavoriteMovies: req.params.MovieId }
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
app.put("/users/:Username", passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 6 }),
    check("Password", "Password is required"),
    check("Email", "Email not found").isEmail()
  ],
  passport.authenticate('jwt', { session: false }), async (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission denied');
    }
    await Users.findOneAndUpdate({ Username: req.params.Username },
      {
        $set:
        {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email
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
app.delete("/users/:Username/movies/:MovieId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieId },
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

//DELETE user by username
app.delete('/users/:Username', passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//READ get all movies
app.get("/movies", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//READ get all users
app.get("/users", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//READ get user by username
app.get("/users/:Username", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//READ get movie by title
app.get("/movies/title/:Title", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      if (!movie) {
        return res.status(400).send("Error: " + req.params.Title + "was not found")
      } else {
        res.status(200).json(movie)
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//READ get data about director by director name
app.get("/movies/directors/:Name", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Movies.findOne({ "Director.Name": req.params.Name })
    .then((movie) => {
      if (!movie) {
        return res.status(400).send("Error: " + req.params.Director + "was not found")
      } else {
        res.status(200).json(movie.Director)
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.get('/movie/directors', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const directors = await Directors.find();
    res.json(directors);
  } catch (error) {
    console.error('Error', error);
    res.status(500).json({ error: 'Error' });
  }
});

app.get("/genre", (req, res) => {
  Movies.distinct("Genre")
    .then((genres) => {
      res.status(201).json(genres);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Read: Return data about a genre by genre name
app.get("/genre/:genreName", (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.genreName })
    .then((movie) => {
      res.status(201).json(movie.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});


//READ get genre description by genre
app.get("/movies/genre/:Genre", passport.authenticate("jwt", { session: false }), async (req, res) => {
  await Movies.findOne({ "Genre.Name": req.params.Genre })
    .then((movie) => {
      if (!movie) {
        return res.status(400).send("Error: " + req.params.Genre + "was not found")
      } else {
        res.status(200).json(movie.Genre.Description);
      }
    })

    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Listening on Port " + port);
});
