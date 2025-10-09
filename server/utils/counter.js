const Counter = require("../models/CounterModel");

exports.getNextCounter = async (key) => {
  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  const paddedSeq = counter.seq.toString().padStart(5, "0");

  if (key === "employee") return `EMP-${paddedSeq}`;


  return paddedSeq;
};
