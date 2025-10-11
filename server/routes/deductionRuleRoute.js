const express = require("express");
const router = express.Router();
const { createRuleCtrl, updateRuleCtrl, listRulesCtrl, deleteRuleCtrl } = require("../controllers/deductionRuleCtrl");

router.post("/create", createRuleCtrl);
router.put("/update/:id", updateRuleCtrl);
router.get("/list", listRulesCtrl);
router.delete("/delete/:id", deleteRuleCtrl);

module.exports = router;