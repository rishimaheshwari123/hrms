const express = require("express");
const router = express.Router();
const {
  upsertHolidayCtrl,
  deleteHolidayCtrl,
  listHolidaysCtrl,
} = require("../controllers/holidayCtrl");

// Admin: create or update holiday
router.post("/upsert", upsertHolidayCtrl);
router.put("/upsert/:id", upsertHolidayCtrl);

// Admin: delete holiday
router.delete("/delete/:id", deleteHolidayCtrl);

// Public: list holidays by month/year
router.get("/list", listHolidaysCtrl);

module.exports = router;