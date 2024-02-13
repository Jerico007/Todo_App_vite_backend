/* eslint-disable no-undef */

const todoChecks = ({ title, description, color }) => {
  return new Promise((resolve, reject) => {
    if (typeof title !== "string") {
      reject("title must be a string");
    }

    if (typeof description !== "string") {
      reject("description must be a string");
    }

    if (typeof color !== "string") {
      reject("color must be a string");
    }
    return resolve();
  });
};

module.exports = todoChecks;
