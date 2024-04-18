import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
  eventName: {
    type: String,
    required: true,
    unique: true,
  },
  firstClosureDate: String,
  finalClosureDate: String,
  faculty: {
    type: String,
    ref: "Faculty",
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear",
    required: true,
  },
  contributions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contribution",
      required: true,
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
