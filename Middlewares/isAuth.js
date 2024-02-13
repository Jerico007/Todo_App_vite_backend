/* eslint-disable no-undef */
const isAuth = (req, res, next) => {
  if (!req.session.isAuth) {
    return res.send({
      status: 400,
      message: "Please Login/Signup.",
      isValid: false,
    });
  }
  next();
};

module.exports = isAuth;
