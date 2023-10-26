//creates a write stream
const accessLogStream = fs.createWriteStream(path.join(__dirname, "log,txt"), {
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
