import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRouter from "./routes/userRoutes.js";
import connectDB from "./config/db.js";
import cors from "cors";
// import Comment from "./models/commentModel.js";
// import Contribution from "./models/contributionModel.js";
// import Event from "./models/eventModel.js";
// import { Faculty } from "./models/facultyModel.js";
// import Statistic from "./models/statisticModel.js";
// import { Role } from "./models/roleModel.js";
// import User from "./models/userModels.js";
// import AcademicYear from "./models/academicYearModel.js";
// import File from "./models/fileModel.js";
dotenv.config();
const port = process.env.PORT || 5000;
connectDB();
// Comment();
// Contribution();
// Event();
// Faculty();
// Statistic();
// Role();
// User();
// AcademicYear();
// File();

const app = express();
let corsOptions = {
  origin: function (_, callback) {
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/", userRouter);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
