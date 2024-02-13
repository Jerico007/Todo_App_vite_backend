/* eslint-disable no-undef */

// Constants for server
const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const PORT = process.env.PORT || 7999;
const cors = require("cors");
const cli = require("cli-color");
const app = express();
const bcrypt = require("bcrypt");
const validator = require("validator");
// Session constants
const session = require("express-session");


const MongoDbStore = require("connect-mongodb-session")(session);
// Middleware constants
const isAuth = require("./Middlewares/isAuth");

const store = new MongoDbStore({
  uri: process.env.MONGO_URI,
  collection: "usersessions",
});

// sessionModal
const sessionModal = require("./Modals/sessionModal");

// userModal
const userModal = require("./Modals/userModal");

// TodoModal
const TodoModal = require("./Modals/TodoModal");

// Authutils
const { authenticate } = require("./utils/authUtils");

// todoUtils
const todoChecks = require("./utils/TodoUtils");



// Db connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(cli.yellowBright("DB connection established successfully"));
  })
  .catch((err) => console.log(cli.redBright(err.message)));

// Setting ejs
// app.set("view engine", "ejs");

// Middleware

app.use(cors({origin:"https://todo-app-vite-frontend.vercel.app",credentials:true}));
// Data conversion from urlencoded to object
app.use(express.urlencoded({ extended: true }));
// Data conversion from json body to object
app.use(express.json());
// session middleware
app.use(
  session({
    key:"userId",
    secret: process.env.SECRET,
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);



// SignIn get request API
// app.get("/signUp", (req, res) => {
//   res.render("signIn");
// });

// logIn get request API
// app.get("/logIn", (req, res) => {
//   res.render("logIn");
// });

// Delete todo ApI post request
app.post("/deletetodo", isAuth, async (req, res) => {
  const { todoId } = req.body;

  const { userName } = req.session.userData;

  try {
    const userDb = await TodoModal.findById({ _id: todoId });

    if (userDb.userName !== userName) {
      return res.send({
        status: 403,
        message: "Unauthorized user access!",
      });
    }
  } catch (err) {
    return res.send({
      status: 404,
      message: "Todo not found",
      error: err,
    });
  }

  try {
    await TodoModal.findByIdAndDelete({ _id: todoId });
    return res.send({
      status: 200,
      message: "Todo deleted successfully",
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      error: err,
    });
  }
});

// Update todo API post request
app.post("/updateTodo", isAuth, async (req, res) => {
  const { updatedData, todoId } = req.body;

  const { userName } = req.session.userData;

  const { title, description, color } = updatedData;

  try {
    await todoChecks({ title, description, color });
  } catch (err) {
    return res.send({
      status: 400,
      message: err,
    });
  }

  try {
    const userDb = await TodoModal.findById({ _id: todoId });

    if (userDb.userName !== userName) {
      return res.send({
        status: 403,
        message: "Unauthorized user access!",
      });
    }
  } catch (err) {
    return res.send({
      status: 404,
      message: "Todo not found",
      error: err,
    });
  }

  try {
    await TodoModal.findByIdAndUpdate({ _id: todoId }, { todo: updatedData });

    return res.send({
      status: 201,
      message: "User data updated successfully",
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      error: err,
    });
  }
});

// Read todo API get request
app.get("/readtodo", isAuth, async (req, res) => {
  const { userName } = req.session.userData;

  const userDb = await TodoModal.find({ userName: userName });

  if (!userDb) {
    return res.send({
      status: 404,
      message: "No Todo's were found",
    });
  }

  res.send({
    status: 200,
    message: "Data fetched successfully.",
    data: userDb,
  });
});

// Create todo API post request
app.post("/createtodo", isAuth, async (req, res) => {
  const { title, description, color } = req.body;

  try {
    await todoChecks({ title, description, color });
  } catch (err) {
    return res.send({
      status: 400,
      message: err,
    });
  }

  const todoList = new TodoModal({
    todo: {
      title: title.trim(),
      description: description.trim(),
      color: color.trim(),
      createdAt: Date.now(),
    },
    userName: req.session.userData.userName,
  });

  try {
    const todoData = await todoList.save();

    return res.send({
      status: 201,
      message: "Todo successfully saved",
      todoData: todoData,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database error",
      error: err,
    });
  }
});

// Dashboard get request API
app.get("/dashboard", isAuth, (req, res) => {
  return res.send({
    status: 200,
    message: "Access granted",
    isValid: true,
  });
});

// Logout get request API
app.get("/logOut", isAuth, async (req, res) => {
  // Methode 1
  // req.session.destroy();

  // Methode 2
  try {
    const userName = req.session.userData.userName;
    await sessionModal.deleteOne({ "session.userData.userName": userName });
    return res.send({ status: 200, message: "Logged out successfully!" });
  } catch (err) {
    return res.send({ status: 500, message: "Logout failed", error: err });
  }
});

// Logout All get request API
app.get("/logoutall", isAuth, async (req, res) => {
 
  const userName = req.session.userData.userName;

  try {
    await sessionModal.deleteMany({ "session.userData.userName": userName });
    return res.send({
      status: 200,
      message: "Logged out from all devices.",
    });
  } catch (err) {
    res.send({
      status: 500,
      message: "Logout All failed",
      error: err,
    });
  }
});

// SignUp post request API
app.post("/signUp", async (req, res) => {
  const { name, email, password, userName } = req.body;

  try {
    await authenticate({ name, email, password, userName });
  } catch (err) {
    return res.send({
      status: 400,
      error: err,
    });
  }

  // Encrypting password
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(process.env.SALT)
  );

  // UserModal
  const user = new userModal({
    name: name,
    email: email,
    userName: userName,
    password: hashedPassword,
  });

  // IF userName already exists
  const userNameExist = await userModal.findOne(
    { userName: user.userName },
    "userName"
  );
  if (userNameExist !== null) {
    return res.send({
      status: 400,
      message: "User name already exists",
    });
  }

  // IF user email already exists
  const userEmailExist = await userModal.findOne(
    { email: user.email },
    "email"
  );
  if (userEmailExist !== null) {
    return res.send({
      status: 400,
      message: "Email already exists",
    });
  }

  // Saving user in the database
  try {
    const userData = await user.save();
    req.session.isAuth = true;
    req.session.userData = {
      uid: userData._id,
      userName: userData.userName,
      email: userData.email,
    };
    return res.send({
      status: 201,
      message: "User created successfully",
      data: userData,
    });
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database Error",
      error: err,
    });
  }
});

// LogIn post request API
app.post("/logIn", async (req, res) => {
  const { loginId, password } = req.body;

  try {
    if (validator.isEmail(loginId)) {
      const user = await userModal.findOne({ email: loginId });
      if (!user) {
        return res.send({
          status: 400,
          message: "Email not found",
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.isAuth = true;
        req.session.userData = {
          uid: user._id,
          userName: user.userName,
          email: user.email,
        };
        return res.send({
          status: 200,
          message: "User logged in successfully",
        });
      }
      return res.send({
        status: 400,
        message: "Passwords do not match",
      });
    } else {
      const user = await userModal.findOne({ userName: loginId });
      if (!user) {
        return res.send({
          status: 400,
          message: "User name not found",
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.isAuth = true;
        req.session.userData = {
          uid: user._id,
          userName: user.userName,
          email: user.email,
        };
        return res.send({
          status: 200,
          message: "User logged in successfully",
        });
      }
      return res.send({
        status: 400,
        message: "Passwords do not match",
      });
    }
  } catch (err) {
    return res.send({
      status: 500,
      message: "Database Error",
      error: err,
    });
  }
});

app.listen(PORT, () => {
  console.log(cli.blueBright(`Servert listening on http://localhost:${PORT}`));
});
