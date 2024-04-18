import User from "../models/userModels.js";

import bcrypt from "bcryptjs";

import createToken from "../utils/createToken.js";

import Contribution from "../models/contributionModel.js";
import File from "../models/fileModel.js";
import { sendEmailNotification } from "./marketingCoordinatorController.js";
import Event from "../models/eventModel.js";

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (isPasswordValid) {
      const token = createToken(res, existingUser._id);
      // res.cookie("jwt", token, {
      //   httpOnly: true,
      //   sameSite: "Lax",
      //   secure: true,
      //   maxAge: 24 * 60 * 60 * 1000,
      // });
      res.status(200).json({
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        isAdmin: existingUser.isAdmin,
        role: existingUser.role,
        faculty: existingUser.faculty,
        accessToken: token,
      });
      return;
    }
  }
};
const logoutUser = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      username: user.username,
      email: user.email,
      role: user.role,
      faculty: user.faculty,
      agreement: user.agreement,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};

const handleUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const eventId = req.body.eventId;
    const fileIds = [];
    for (const file of req.files) {
      const { originalname, mimetype, filename, path } = file;
      const newFile = new File({
        originalname,
        mimetype,
        filename,
        path,
      });
      const savedFile = await newFile.save();
      fileIds.push(savedFile._id);
    }

    // Tạo một bản ghi Contribution và thêm các ID của tệp tin vào trường files
    const userId = req.user.username;
    const submissionDate = req.body.submissionDate
      ? new Date(req.body.submissionDate).toISOString()
      : new Date().toISOString();
    const { faculty, status } = req.body;
    const newContribution = new Contribution({
      username: userId,
      faculty,
      files: fileIds,
      eventId: eventId, // Thêm ID của các tệp tin vào mảng files
      submissionDate,
      status,
      isSelected: true,
    });
    await newContribution.save();

    const event = await Event.findById(eventId);
    event.contributions.push(newContribution._id);
    await event.save();

    sendEmailNotification([newContribution]);
    res.status(200).json({
      message: "File uploaded successfully",
      fileInfo: fileIds,
      eventId: eventId,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Failed to upload file" });
  }
};

const deleteContribution = async (req, res) => {
  try {
    const contributionId = req.query.contributionId;

    // Kiểm tra xem đóng góp có tồn tại không
    const existingContribution = await Contribution.findById(contributionId);
    if (!existingContribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    // Xóa đóng góp từ cơ sở dữ liệu
    await Contribution.findByIdAndDelete(contributionId);

    res.json({ message: "Contribution deleted successfully" });
  } catch (error) {
    console.error("Error deleting contribution:", error);
    res.status(500).json({ message: "Failed to delete contribution" });
  }
};
const getContributionById = async (req, res) => {
  try {
    const contributionId = req.query.contributionId;

    // Truy vấn đóng góp dựa trên contributionId
    const contribution = await Contribution.findById(contributionId)
    .populate("files")
    .exec();

    // Kiểm tra xem đóng góp có tồn tại không
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found" });
    }

    // Trả về thông tin về đóng góp
    res.status(200).json({ contribution });
  } catch (error) {
    console.error("Error fetching contribution by ID:", error);
    res.status(500).json({ message: "Failed to fetch contribution by ID" });
  }
};

export {
  loginUser,
  logoutUser,
  getProfile,
  handleUpload,
  deleteContribution,
  getContributionById,
};
