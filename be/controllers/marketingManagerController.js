import archiver from "archiver";
import fs from "fs";
import path from "path";
import File from "../models/fileModel.js";
import Contribution from "../models/contributionModel.js";
import User from "../models/userModels.js";
const downloadAllFiles = async (req, res) => {
  try {
    // Create a new archiver instance
    const archive = archiver("zip", {
      zlib: { level: 5 }, // Sets the compression level
    });

    // This is where we will store our files
    const outputFilePath = path.join("be", "file", "all_files.zip");
    const output = fs.createWriteStream(outputFilePath);

    // Pipe archive data to the output file
    archive.pipe(output);

    // Get all files from the database
    const files = await File.find({});

    // Add each file to the archive
    files.forEach((file) => {
      const filePath = path.join("be", "uploads", file.filename);

      if (fs.existsSync(filePath)) {
        archive.append(fs.createReadStream(filePath), { name: file.filename });
      } else {
        console.log(`File not found: ${filePath}`);
      }
    });

    // Finalize the archive (ie we are done appending files but streams have to finish yet)
    archive.finalize();

    // Send the archive as a download to the client
    res.download(outputFilePath);
    res.status(200).json({ message: "Download all files successfully" });
  } catch (error) {
    console.error("Error downloading all files:", error);
    res.status(500).json({ message: "Failed to download all files" });
  }
};
const getContribution = async (req, res) => {
  try {
    const contributions = await Contribution.find({})
      .populate("files") // Nối (populate) các tệp từ model "File"
      .exec();

    res.status(200).json(contributions);
  } catch (error) {
    console.error("Error retrieving contributions:", error);
    throw new Error("Failed to retrieve contributions");
  }
};

const getContributionImg = async (req, res) => {
  let image = req.params.name;
  const __dirname = path.resolve();
  let filePath = path.join(__dirname, `be/uploads/${image}`);
  res.sendFile(filePath);
}

const getDashboardStatistics = async (req, res) => {
  try {
    // Số lượng đóng góp từ mỗi khoa
    const contributionsPerFaculty = await Contribution.aggregate([
      { $group: { _id: "$faculty", count: { $sum: 1 } } },
    ]);

    // Đếm số lượng sinh viên trong mỗi khoa từ collection người dùng
    const studentsCountPerFaculty = await User.aggregate([
      { $match: { role: "student" } }, // Lọc các người dùng có vai trò là sinh viên
      { $group: { _id: "$faculty", count: { $sum: 1 } } }, // Đếm số lượng sinh viên theo khoa
    ]);

    // Tổng số lượng sinh viên
    const totalStudents = studentsCountPerFaculty.reduce(
      (acc, cur) => acc + cur.count,
      0
    );

    // Tính tỉ lệ đóng góp từ mỗi khoa
    const totalContributions = contributionsPerFaculty.reduce(
      (acc, cur) => acc + cur.count,
      0
    );
    const percentagePerFaculty = contributionsPerFaculty.map((faculty) => ({
      faculty: faculty._id,
      percentage: ((faculty.count / totalContributions) * 100).toFixed(2),
    }));

    res.status(200).json({
      contributionsPerFaculty,

      studentsCountPerFaculty,
      totalStudents,
      percentagePerFaculty,
    });
  } catch (error) {
    console.error("Error getting dashboard statistics:", error);
    res.status(500).json({ message: "Failed to get dashboard statistics" });
  }
};
export { downloadAllFiles, getContribution, getDashboardStatistics, getContributionImg };
