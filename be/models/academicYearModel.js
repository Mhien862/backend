import mongoose from "mongoose";

const academicYearSchema = mongoose.Schema({
  year: {
    type: Number,
    unique: true,
    required: true,
  },
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
  ],
  firstClosureDate: Date,
  finalClosureDate: Date,
});

const AcademicYear = mongoose.model("AcademicYear", academicYearSchema);

export default AcademicYear;
