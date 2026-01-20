const router = require("express").Router();
const upload = require("../middlewares/multer")
const { signUp, login, updateUser, getUserProfile, createWallet, getAllUsers } = require("../controllers/userController");

router.post("/signup", signUp);
router.post("/login", login);
router.put("/update/:id", upload.single('avatar'), updateUser);
router.get("/getProfile/:id", getUserProfile);
router.get("/getall", getAllUsers);
router.post("/createWallet/:id", createWallet)
module.exports = router;
