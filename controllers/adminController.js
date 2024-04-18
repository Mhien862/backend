import User from "../models/userModels.js";
import { Role } from "../models/roleModel.js";
import bcrypt from "bcryptjs";
import { Faculty } from "../models/facultyModel.js";
import Event from "../models/eventModel.js";
import AcademicYear from "../models/academicYearModel.js";
import createToken from "../utils/createToken.js";

const registerUser = async (req, res) => {
  try {
    const { username, password, email, roleName, facultyName, agreement } =
      req.body;

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tìm vai trò dựa trên tên vai trò
    const role = await Role.findOne({ roleName });
    const faculty = await Faculty.findOne({ facultyName });
    // Kiểm tra xem vai trò có tồn tại không
    if (!role) {
      return res.status(400).json({ message: "Role not found" });
    }
    if (!faculty) {
      return res.status(400).json({ message: "Faculty not found" });
    }

    // Tạo một đối tượng user mới từ dữ liệu được gửi từ client
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      role: roleName,
      faculty: facultyName,
      agreement, // Lưu tên của vai trò vào cơ sở dữ liệu
    });

    // Lưu user mới vào cơ sở dữ liệu
    await newUser.save();
    // Tạo và gửi token cho user sau khi đăng ký thành công
    // createToken(res, newUser._id);
    // Trả về phản hồi thành công
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Nếu có lỗi, trả về phản hồi lỗi và thông báo lỗi
    console.error("Error: ", error);
    res.status(500).json({ message: "Username or email already exists" });
  }
};
const getAllUser = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};
const updateUser = async (req, res) => {
  const user = await User.findById(req.query.userId);
  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.faculty = req.body.faculty || user.faculty;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      faculty: updatedUser.faculty,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};
const deleteUser = async (req, res) => {
  const user = await User.findById(req.query.userId);
  if (user) {
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
};
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.query.userId);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ message: "Failed to retrieve user" });
  }
};
const getUserList = async (req, res) => {
  try {
    const userList = await User.find({});
    res.json(userList);
  } catch (error) {
    console.error("Error retrieving user list:", error);
    res.status(500).json({ message: "Failed to retrieve user list" });
  }
};
const createEvent = async (req, res) => {
  try {
    const {
      eventName,
      firstClosureDate = new Date(firstClosureDate).toISOString(),
      finalClosureDate = new Date(finalClosureDate).toISOString(),
      faculty,
      academicYearId,
    } = req.body;

    if (!eventName || !firstClosureDate || !finalClosureDate || !faculty) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (finalClosureDate <= firstClosureDate) {
      return res.status(400).json({
        message: "Final closure date must be after first closure date",
      });
    }

    // Tạo sự kiện mới
    const newEvent = new Event({
      eventName,
      firstClosureDate,
      finalClosureDate,
      faculty,
      academicYear: academicYearId,
    });

    await newEvent.save();
    await AcademicYear.findByIdAndUpdate(academicYearId, {
      $push: { events: newEvent._id },
    });

    return res
      .status(201)
      .json({ message: "Event created successfully", event: newEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Event name already exists" });
  }
};
const getEventList = async (req, res) => {
  try {
    // Lấy danh sách sự kiện từ cơ sở dữ liệu
    const events = await Event.find();

    // Trả về danh sách sự kiện
    res.status(200).json({ events });
  } catch (error) {
    console.error("Error fetching event list:", error);
    res.status(500).json({ message: "Failed to fetch event list" });
  }
};
const getEventById = async (req, res) => {
  try {
    // Lấy ID của sự kiện từ yêu cầu
    const eventId = req.query.eventId;

    // Kiểm tra xem eventId có hợp lệ không
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // Tìm sự kiện từ cơ sở dữ liệu bằng ID
    const event = await Event.findById(eventId);

    // Kiểm tra xem sự kiện có tồn tại không
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Trả về thông tin của sự kiện
    res.status(200).json({ event });
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    res.status(500).json({ message: "Failed to fetch event by ID" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const eventId = req.query.eventId;
    const {
      eventName,
      firstClosureDate = new Date(firstClosureDate).toISOString(),
      finalClosureDate = new Date(firstClosureDate).toISOString(),
      faculty,
    } = req.body;

    // Tìm sự kiện trong cơ sở dữ liệu dựa trên eventId
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (eventName) {
      event.eventName = eventName;
    }
    if (firstClosureDate) {
      // Chuyển đổi firstClosureDate sang đối tượng Moment với múi giờ Việt Nam
      event.firstClosureDate = firstClosureDate;
    }
    if (finalClosureDate) {
      // Chuyển đổi finalClosureDate sang đối tượng Moment với múi giờ Việt Nam
      event.finalClosureDate = finalClosureDate;
    }
    if (faculty) {
      event.faculty = faculty;
    }

    // Kiểm tra nếu finalClosureDate trước hoặc bằng firstClosureDate
    if (event.finalClosureDate <= event.firstClosureDate) {
      return res.status(400).json({
        message: "Final closure date must be after first closure date",
      });
    }

    // Lưu lại sự kiện đã được cập nhật vào cơ sở dữ liệu
    const updatedEvent = await event.save();

    // Trả về phản hồi thành công
    res
      .status(200)
      .json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const eventId = req.query.eventId;

    // Tìm sự kiện trong cơ sở dữ liệu dựa trên eventId
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Xóa sự kiện từ cơ sở dữ liệu
    await Event.findByIdAndDelete(eventId);

    // Trả về phản hồi thành công
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
};

const createAcademicYear = async (req, res) => {
  try {
    const {
      year,
      firstClosureDate = new Date(firstClosureDate).toISOString(),
      finalClosureDate = new Date(firstClosureDate).toISOString(),
    } = req.body;
    const existingYear = await AcademicYear.findOne({ year });

    if (existingYear) {
      return res.status(400).json({ message: "Academic year already exists" });
    }

    const academicYear = new AcademicYear({
      year,
      firstClosureDate,
      finalClosureDate,
    });

    await academicYear.save();
    res.status(201).json({
      message: "Academic year created successfully",
      academicYear: academicYear,
    });
  } catch (error) {
    console.error("Error creating academic year:", error);
    res.status(500).json({ message: "Failed to create academic year" });
  }
};
const updateAcademicYear = async (req, res) => {
  try {
    const {
      year,
      firstClosureDate = new Date(firstClosureDate).toISOString(),
      finalClosureDate = new Date(firstClosureDate).toISOString(),
    } = req.body;

    const academicYear = await AcademicYear.findById(req.query.academicYearId);

    if (!academicYear) {
      return res.status(404).json({ message: "Academic year not found" });
    }

    if (year) {
      academicYear.year = year;
    }
    if (firstClosureDate) {
      academicYear.firstClosureDate = firstClosureDate;
    }
    if (finalClosureDate) {
      academicYear.finalClosureDate = finalClosureDate;
    }

    await academicYear.save();
    res.json({
      message: "Academic year updated successfully",
      academicYear: academicYear,
    });
  } catch (error) {
    console.error("Error updating academic year:", error);
    res.status(500).json({ message: "Failed to update academic year" });
  }
};
const deleteAcademicYear = async (req, res) => {
  try {
    // Kiểm tra xem năm học có tồn tại không
    const academicYear = await AcademicYear.findById(req.query.academicYearId);
    if (!academicYear) {
      return res.status(404).json({ message: "Academic year not found" });
    }

    // Nếu năm học tồn tại, xóa nó từ cơ sở dữ liệu
    await AcademicYear.findByIdAndDelete(academicYear);

    res.status(200).json({ message: "Academic year deleted successfully" });
  } catch (error) {
    console.error("Error deleting academic year:", error);
    res.status(500).json({ message: "Failed to delete academic year" });
  }
};
export {
  registerUser,
  getAllUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserList,
  createEvent,
  updateEvent,
  deleteEvent,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  getEventList,
  getEventById,
};
