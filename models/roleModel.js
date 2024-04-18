import mongoose from "mongoose";

// Định nghĩa schema cho vai trò (Roles)
const roleSchema = mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true,
  },
});

const Role = mongoose.model("Role", roleSchema);

const createRoles = async () => {
  try {
    const rolesData = [
      { roleName: "marketing manager" },
      { roleName: "marketing coordinator" },
      { roleName: "guest" },
      { roleName: "student" },
      { roleName: "admin" },
    ];

    // Lưu các vai trò vào cơ sở dữ liệu
    await Role.insertMany(rolesData);

    console.log("Roles created successfully");
  } catch (error) {
    console.error("Error creating roles:", error);
  }
};

export { Role, createRoles };
