/* eslint-disable no-undef */

// const { request } = require('http');
const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
  // if (!req.session.isAuth) {
  //   return res.send({
  //     status: 400,
  //     message: "Please Login/Signup.",
  //     isValid: false,
  //   });
  // }
  let token = req.headers.authorization;
// 

  if(!token)
  {
    return res.send({
          status: 401,
          message: "No token Provided.",
          isValid: false,
        });
  }
  
  token = token.split(" ");
  token = token[1].trim();
  jwt.verify(token,process.env.SECRET,function(err,decoded){
    if(err){
     return res.send({
        status: 401,
        message:"Token has expired"
      });
    }
    req.userToken = {...decoded};
    next();
  })
};

module.exports = isAuth;
