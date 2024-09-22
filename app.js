const express = require("express");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'smoketree',
  password: 'Devanshu@123',
  port: 5432,
});


app.post("/register", async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    return res.status(400).send("Please provide both name and address.");
  }

  try {
    
    await pool.query("BEGIN");

   
    const userResult = await pool.query(
      "INSERT INTO \"User\" (name) VALUES ($1) RETURNING id",
      [name]
    );
    const userId = userResult.rows[0].id;

    
    await pool.query(
      "INSERT INTO \"Address\" (user_id, address) VALUES ($1, $2)",
      [userId, address]
    );

   
    await pool.query("COMMIT");

    res.send("User and address registered successfully!");
  } catch (error) {
    
    await pool.query("ROLLBACK");
    console.error(error);
    res.status(500).send("An error occurred while registering the user.");
  }
});

// Basic form to collect user data
app.get("/", (req, res) => {
  res.send(`
    <form action="/register" method="POST">
      <label for="name">Name:</label>
      <input type="text" id="name" name="name" required><br><br>
      <label for="address">Address:</label>
      <input type="text" id="address" name="address" required><br><br>
      <button type="submit">Submit</button>
    </form>
  `);
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
