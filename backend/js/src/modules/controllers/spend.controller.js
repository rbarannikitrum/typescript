"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSpend = exports.updateSpend = exports.createSpend = exports.getAllSpends = void 0;
const spend_schema_1 = require("../../db/models/spend/spend.schema");
const mongoose_1 = require("mongoose");
const createSpend = (req, res) => {
    const { place, price } = req.body;
    try {
        if (price > 0) {
            const time = new Date();
            const permanentTime = new Date();
            const spend = new spend_schema_1.Spend({ place, time, price, permanentTime });
            spend.save().then(result => res.send(result));
        }
        else {
            res.status(400).send('uncorrected data');
        }
    }
    catch (error) {
        if (error instanceof mongoose_1.Error) {
            res.status(500).send({ message: error.message });
        }
        else {
            res.status(500).send(`server error : ${error}`);
        }
    }
};
exports.createSpend = createSpend;
const getAllSpends = (req, res) => {
    try {
        spend_schema_1.Spend.find().then(result => {
            res.send(result);
        });
    }
    catch (error) {
        res.status(500).send(`server error : ${error}`);
    }
};
exports.getAllSpends = getAllSpends;
const updateSpend = (req, res) => {
    try {
        let { _id, place, time, price, permanentTime } = req.body;
        time = new Date(time);
        permanentTime = new Date(permanentTime);
        if (price > 0 &&
            time.toString() != 'Invalid Date' &&
            Math.abs(new Date(time).getTime() - new Date(permanentTime).getTime()) / (60 * 60 * 24 * 1000) < 7) {
            spend_schema_1.Spend.findByIdAndUpdate(_id, { place, time, price }).then(result => res.send(result));
        }
        else
            res.status(400).send('uncorrected data');
    }
    catch (error) {
        if (error instanceof mongoose_1.Error) {
            res.status(500).send({ message: error.message });
        }
        else {
            res.status(500).send(`server error : ${error}`);
        }
    }
};
exports.updateSpend = updateSpend;
const deleteSpend = (req, res) => {
    try {
        spend_schema_1.Spend.findByIdAndDelete({ _id: req.query._id }).then(result => res.status(200).send(result));
    }
    catch (error) {
        if (error instanceof mongoose_1.Error) {
            res.status(500).send({ message: error });
        }
        else {
            res.status(500).send(`server error : ${error}`);
        }
    }
};
exports.deleteSpend = deleteSpend;
