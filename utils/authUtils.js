/* eslint-disable no-undef */
const validate = require("validator");


const authenticate = ({ name, email, userName, password }) => {
  return new Promise((resolve, reject) => {
    if (!name || typeof name !== "string" || !validate.matches(name, /^[A-Za-z ]+$/)) {
      reject("Invalid username");
    }

    if (!email || typeof email !== "string" || !validate.isEmail(email)) {
      reject("Invalid email");
    }

    if (!userName || typeof userName !== "string") {
      reject("Invalid user name");
    }

    if (
      !password ||
      typeof password !== "string" ||
      !validate.isStrongPassword(password, {
        minLength: 4,
        minNumbers: 4,
        minLowercase: 0,
        minUppercase: 0,
        minSymbols: 0,
      }) ||
      !validate.isNumeric(password)
    ) {
      reject("Invalid password");
    }

    resolve("User authenticated successfully");
  });
};

module.exports = { authenticate };
