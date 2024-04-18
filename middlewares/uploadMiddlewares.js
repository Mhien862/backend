import multer from "multer";
import path from "path";
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "be/uploads"); // Thư mục lưu trữ file, bạn có thể thay đổi đường dẫn tùy ý
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + "-" + file.fieldname + ext); // Tên file: timestamp-fieldname-originalname
  },
});

// Kiểm tra và lọc loại file cho phép
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]; // Danh sách các loại file cho phép
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Chấp nhận file
  } else {
    cb(new Error("Only JPEG, PNG, and GIF files are allowed!"));
  }
};

// Khởi tạo middleware multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 100,
    files: 5,
  },
});

// API upload file
const uploadFile = upload.array("files", 5);
export { uploadFile };
