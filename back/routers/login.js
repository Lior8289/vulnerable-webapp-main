const sql = require("mssql");
const express = require("express");
const { getPool } = require("../db/dbUtils.js");

const router = express.Router();
const {
  generateSalt,
  hashPassword,
  getPasswordPolicy,
} = require("../utils/auth.js");

router.post("/", async (req, res) => {
  const username = req.body.username;
  const inputPassword = req.body.password;
  const missingParameters = [];
  if (!username) missingParameters.push("username");
  if (!inputPassword) missingParameters.push("password");
  if (missingParameters.length) {
    return res.status(400).json({
      success: false,
      error: "missing parameters: " + missingParameters.join(","),
    });
  }

  try {
    const pool = req.app.locals.dbPool;

    const selectQuery =
      "SELECT user_id,username,email,first_name,last_name,password,salt,login_attempts " +
      "FROM Users WHERE username = '" +
      username +
      "'";
    const result = await pool.request().query(selectQuery);

    if (result.recordset.length > 0) {
      const {
        password: storedHash,
        salt,
        user_id,
        login_attempts: currLoginAttempts,
      } = result.recordset[0];

      const policy = getPasswordPolicy();
      if (currLoginAttempts >= policy.maxLoginAttempts) {
        return res.status(403).json({
          success: false,
          error_msg: "Maximum login attempts exceeded. Your user blocked.",
        });
      }

      const secretKey = process.env.SECRET_KEY;
      const inputHashed = hashPassword(inputPassword, salt, secretKey);
      const isLogin = inputHashed === storedHash;

      if (isLogin) {
        const resetQuery =
          "UPDATE Users SET login_attempts = 0 WHERE user_id = '" +
          user_id +
          "'";
        await pool.request().query(resetQuery);

        return res.status(200).json({
          success: true,
          user: {
            user_id: result.recordset[0].user_id,
            username: result.recordset[0].username,
            email: result.recordset[0].email,
            first_name: result.recordset[0].first_name,
            last_name: result.recordset[0].last_name,
          },
        });
      } else {
        const newAttempts = currLoginAttempts + 1;
        console.log(
          `Login attempt failed for user: ${username}. Current attempts: ${newAttempts}`
        );

        const incrementQuery =
          "UPDATE Users SET login_attempts = " +
          newAttempts +
          " WHERE user_id = '" +
          user_id +
          "'";
        await pool.request().query(incrementQuery);
      }
    }

    return res.status(401).json({
      success: false,
      error_msg: "username or password incorrect",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      error_msg: "Internal Server Error",
    });
  }
});

module.exports = router;
