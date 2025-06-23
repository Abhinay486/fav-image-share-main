import express from "express";
import { isAuth } from '../middlewares/isAuth.js';
import { cmntonPin, createPin, deleteComment, deletePin, getAllPins, getSinglepins, updatePin } from "../controllers/pinControllers.js";
import uploadFile from "../middlewares/multer.js";
const router = express.Router();
router.post("/new", isAuth, uploadFile, createPin)
router.get("/all", getAllPins);
router.get("/:id", isAuth, getSinglepins);
router.put("/:id", isAuth, updatePin);
router.delete("/:id", isAuth, deletePin);
router.post("/comment/:id", isAuth, cmntonPin);
router.delete("/comment/:id", isAuth, deleteComment);


export default router;

