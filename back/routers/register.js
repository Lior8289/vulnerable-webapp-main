const express = require("express");
const crypto = require("crypto");
const sql = require("mssql");
const { getPool } = require("../db/dbUtils.js");
const router = express.Router();
const {
  generateSalt,
  hashPassword,
  createGuid,
  getPasswordPolicy,
} = require("../utils/auth.js");

router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, username, email, password } = req.body;
    const missingParameters = [];

    if (!first_name) missingParameters.push("first_name");
    if (!last_name) missingParameters.push("last_name");
    if (!username) missingParameters.push("username");
    if (!email) missingParameters.push("email");
    if (!password) missingParameters.push("password");
    if (missingParameters.length) {
      return res.status(400).json({
        success: false,
        error: "missing parameters: " + missingParameters.join(","),
      });
    }
    const pool = req.app.locals.dbPool;
    if (!pool) {
      return res
        .status(500)
        .json({ success: false, error: "Database connection failed" });
    }
    const isUserExist = await checkForExistUser(username, email, pool);
    if (isUserExist) {
      return res.status(400).json({
        success: false,
        error: "Username or Email are already taken.",
      });
    } else if (isUserExist === null) {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
    const policy = getPasswordPolicy();
    let passwordError = "";
    if (password.length < policy.minLength) {
      passwordError = `Password must be at least ${policy.minLength} characters long.`;
    } else if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      passwordError = "Password must contain at least one uppercase letter.";
    } else if (policy.requireLowercase && !/[a-z]/.test(password)) {
      passwordError = "Password must contain at least one lowercase letter.";
    } else if (policy.requireNumbers && !/[0-9]/.test(password)) {
      passwordError = "Password must contain at least one number.";
    } else if (policy.requireSpecialChars && !/[^a-zA-Z0-9]/.test(password)) {
      passwordError = "Password must contain at least one special character.";
    } else if (
      policy.dictionaryBlocklist.some((bad) => password.includes(bad))
    ) {
      passwordError = "Password contains a blocked word or phrase.";
    }
    if (passwordError) {
      return res.status(400).json({
        success: false,
        error: passwordError,
      });
    }
    const result = await insertToDB(req.body, pool);
    res.status(result ? 200 : 500).json({
      success: result,
      error_message: !result ? "Failed to insert user into the database." : "",
    });
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

async function insertToDB(data, pool) {
  try {
    const sqlText = `
      INSERT INTO Users (user_id, first_name, last_name, username, email, password, salt)
      VALUES ('${data.username + data.email}', '${data.first_name}',
              '${data.last_name}', '${data.username}', '${data.email}',
              '${data.password}', 'dummySalt')
    `;
    await pool.request().query(sqlText);
    return true;
  } catch (err) {
    console.log("❌ Error inserting user:", err);
    return false;
  }
}

async function checkForExistUser(username, email, pool) {
  try {
    const sqlText = `
      SELECT * FROM Users
      WHERE username='${username}' OR email='${email}'
    `;
    const result = await pool.request().query(sqlText);
    return result.recordset.length > 0;
  } catch (err) {
    console.log("❌ Error checking user existence:", err);
    return null;
  }
}

module.exports = router;
