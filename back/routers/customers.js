const sql = require("mssql");
const express = require("express");
const { createGuid } = require("../utils/auth");
const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { id, first_name, last_name, phone, email, birthday } = req.body;
    const missingFields = [];
    if (!id) missingFields.push("id");
    if (!first_name) missingFields.push("first_name");
    if (!last_name) missingFields.push("last_name");
    if (!phone) missingFields.push("phone");
    if (!email) missingFields.push("email");
    if (!birthday) missingFields.push("birthday");
    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        error_msg: `fields required: ${missingFields.join(", ")}`,
      });
    }
    if (!isValidDateFormat(birthday)) {
      return res.status(400).json({
        success: false,
        error_msg: `birthday should be in YYYY-MM-DD format`,
      });
    }
    const pool = req.app.locals.dbPool;
    const _isCustomerExist = await isCustomerExist(id, pool);
    if (_isCustomerExist === null) {
      return res
        .status(500)
        .json({ success: false, error_msg: "server error" });
    } else if (_isCustomerExist) {
      return res
        .status(409)
        .json({ success: false, error_msg: "customer already exists" });
    }
    if (insertToDB(req.body, pool)) {
      return res.status(200).json({
        success: true,
        customer: { id, first_name, last_name, phone, email, birthday },
      });
    } else {
      return res
        .status(500)
        .json({ success: false, error_msg: "server error" });
    }
  } catch (ex) {
    console.log(ex);
    return res.status(500).json({ success: false, error_msg: "server error" });
  }
});

router.get("/get_all", async (req, res) => {
  try {
    const pool = req.app.locals.dbPool;
    const result = await pool.request().query("SELECT * FROM Customers");
    return res.status(200).json({ success: true, customers: result.recordset });
  } catch (ex) {
    console.log(ex);
    return res.status(500).json({ success: false, error_msg: "server error" });
  }
});
router.get("/", async (req, res) => {
  return res.status(404).json({ success: false, error_msg: "not found" });
});

async function insertToDB(customerDetails, pool) {
  try {
    const tableGuid = createGuid(customerDetails.id + customerDetails.phone);
    const sqlText = `
      INSERT INTO Customers
        (table_guid, id, first_name, last_name, phone, email, birthday)
      VALUES
        ('${tableGuid}',
         '${customerDetails.id}',
         '${customerDetails.first_name}',
         '${customerDetails.last_name}',
         '${customerDetails.phone}',
         '${customerDetails.email}',
         '${customerDetails.birthday}')
    `;

    const result = await pool.request().query(sqlText);
    return result.rowsAffected > 0;
  } catch (ex) {
    console.log(ex);
    return false;
  }
}

async function isCustomerExist(id, pool) {
  try {
    const sqlText = `SELECT * FROM Customers WHERE id = '${id}'`;
    const result = await pool.request().query(sqlText);
    return result.recordset.length > 0;
  } catch (ex) {
    console.log(ex);
    return null;
  }
}
function isValidDateFormat(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}
module.exports = router;
