"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const habitController_1 = require("../controllers/habitController");
const router = (0, express_1.Router)();
router.get('/', habitController_1.getHabits);
router.post('/', habitController_1.addHabit);
exports.default = router;
