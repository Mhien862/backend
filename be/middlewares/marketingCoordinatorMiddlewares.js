import { Role } from "../models/roleModel.js";

const isMarketingCoordinator = async (req, res, next) => {
  try {
    // Kiểm tra xem người dùng có vai trò marketing coordinator không
    const roleName = "marketing coordinator";
    const role = await Role.findOne({ roleName });

    if (!role) {
      return res
        .status(403)
        .json({ message: "Marketing coordinator role not found" });
    }

    // Kiểm tra xem vai trò của người dùng có phải là marketing coordinator không
    const userRole = req.user.role; // Giả sử roles của người dùng được lưu trong req.user.roles
    if (userRole !== role.roleName) {
      return res.status(403).json({
        message: "Access denied. User is not a marketing coordinator",
      });
    }

    // Nếu người dùng có vai trò marketing coordinator, tiếp tục thực thi middleware tiếp theo
    next();
  } catch (error) {
    console.error("Error checking user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { isMarketingCoordinator };
