"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const routes_1 = require("./src/modules/routes/routes");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/', routes_1.router);
const URI = (_a = process.env.URI_SPEND) !== null && _a !== void 0 ? _a : '';
if (URI) {
    mongoose_1.default.connect(URI);
}
app.listen(process.env.PORT, () => {
    console.log('hello');
});
