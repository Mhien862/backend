import express from "express";
import {
  loginUser,
  logoutUser,
  getProfile,
  handleUpload,
  deleteContribution,
  getContributionById,
} from "../controllers/userController.js";
import {
  registerUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserList,
  createEvent,
  updateEvent,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  deleteEvent,
  getEventList,
  getEventById,
} from "../controllers/adminController.js";

import {
  authenticate,
  authenticateAdmin,
} from "../middlewares/authMiddlewares.js";
import { uploadFile } from "../middlewares/uploadMiddlewares.js";
import {
  downloadAllFiles,
  getContribution,
  getContributionImg,
  getDashboardStatistics,
} from "../controllers/marketingManagerController.js";
import {
  sendEmailNotification,
  getContributionsPerFaculty,
  sendEmail,
} from "../controllers/marketingCoordinatorController.js";
import { isMarketingCoordinator } from "../middlewares/marketingCoordinatorMiddlewares.js";
const router = express.Router();

//User role

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", authenticate, getProfile);
router
  .route("/upload")
  .post(authenticate, uploadFile, handleUpload)
  .delete(authenticate, deleteContribution)
  .get(authenticate, getContributionById);

//Admin role
router.post("/register", authenticate, authenticateAdmin, registerUser);
router.get("/user", authenticate, authenticateAdmin, getUserById);
router
  .route("/user-list")
  .get(authenticate, authenticateAdmin, getUserList)
  .put(authenticate, authenticateAdmin, updateUser)
  .delete(authenticate, authenticateAdmin, deleteUser);
router.get("/event-by-id/", authenticate, getEventById);
router
  .route("/event")
  .get(authenticate, authenticateAdmin, getEventList)
  .post(authenticate, authenticateAdmin, createEvent)
  .put(authenticate, authenticateAdmin, updateEvent)
  .delete(authenticate, authenticateAdmin, deleteEvent);

router
  .route("/academic-year")
  .post(authenticate, authenticateAdmin, createAcademicYear)
  .put(authenticate, authenticateAdmin, updateAcademicYear)
  .delete(authenticate, authenticateAdmin, deleteAcademicYear);

router.get("/download-all", authenticate, downloadAllFiles);
router.get("/contribution", authenticate, getContribution);
router.get("/contribution-img/:name", authenticate, getContributionImg);
router.get("/dashboard", authenticate, getDashboardStatistics);
router.post("/send-notification", authenticate, sendEmailNotification);
router.post("/send-email", authenticate, sendEmail);
router.get(
  "/contribution-per-faculty",
  authenticate,
  isMarketingCoordinator,
  getContributionsPerFaculty
);

export default router;
