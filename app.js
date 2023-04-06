const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const bcrypt = require("bcrypt");
const dbpath = path.join(__dirname, "userData.db");

app.use(express.json());

let db = null;

instalization = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db ERROR ${e.message}`);
    process.exit(1);
  }
};
instalization();

app.get("/register/", async (request, response) => {
  const getBooksQuery = `
  SELECT
    *
  FROM
    user`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});
//API 1

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);
  const seleectUserQuery = `select * from user where username = '${username}';`;
  const dbuser = await db.get(seleectUserQuery);
  if (dbuser === undefined) {
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const crateUserQuery = `
      INSERT INTO user(username, name, password, gender, location)
      VALUES(
          '${username}',
          '${name}',
          '${hashedPassword}',
          '${gender}',
          '${location}'
      )`;
      // console.log(crateUserQuery);
      await db.run(crateUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//API 2

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const seleectUserQuery = `select * from user where username = '${username}';`;
  const dbuser = await db.get(seleectUserQuery);
  if (dbuser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordMatch = await bcrypt.compare(password, dbuser.password);
    if (isPasswordMatch) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//API 3

app.put("/change-password/", async (request, response) => {
  console.log("hello");
  const { username, oldPassword, newPassword } = request.body;
  const upHashedPassword = await bcrypt.hash(newPassword, 10);
  const seleectUserQuery = `select * from user where username = '${username}';`;
  const dbuser = await db.get(seleectUserQuery);
  const isPasswordMatchChick = await bcrypt.compare(
    oldPassword,
    dbuser.password
  );
  console.log(isPasswordMatchChick);
  if (isPasswordMatchChick) {
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const updatePasssword = `
        UPDATE user
        SET
        password = '${upHashedPassword}'
        where 
        username = '${username}'
        `;
      const dbuser = await db.run(seleectUserQuery);
      response.status(200);
      response.send("Password updated");
    }
  } else {
    response.status(400);
    response.send("Invalid current password");
  }
});
