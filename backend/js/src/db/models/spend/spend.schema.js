"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spend = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const spendScheme = new mongoose_1.default.Schema({
    place: String,
    time: Date,
    price: Number,
    permanentTime: Date
});
const Spend = mongoose_1.default.model('spends', spendScheme);
exports.Spend = Spend;
