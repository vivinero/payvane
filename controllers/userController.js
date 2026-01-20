const userModel = require("../Model/userModel")
const walletModel = require("../Model/walletModel")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const cloudinary = require("../config/coudinary");



exports.signUp = async(req, res)=>{
    try {
        const { fullName, email, password, confirmPassword, phoneNumber} = req.body
         // Check if all fields exist
        if (!fullName|| !email || !password || !confirmPassword || !phoneNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        //check if email exists
        const emailExist = await userModel.findOne({email})
        if (emailExist) {
            return res.status(400).json({message: "Email already exists"})
        }
        //check if password matches
        if (confirmPassword != password) {
            return res.status(400).json({message: "Password does not match"})
        }
        //salt and hash password
        const saltPass = bcrypt.genSaltSync(12) 
        const hashedPass = bcrypt.hashSync(password, saltPass)
        //create new user
        const user = await userModel.create({
            fullName,
            email,
            phoneNumber,
            password: hashedPass
        })

        //success response
        res.status(201).json({
            message: `Dear ${fullName}, you have successfully signed up with this ${email} email`, 
            user
        })
        
    } catch (error) {
            console.log(error);
            res.status(400).json({
            message: "Error in signup",
            error: error.message
        })
    }
}



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // compare password
    const comparePass = bcrypt.compareSync(password, user.password);
    if (!comparePass) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(200).json({
      message: `Welcome back ${user.fullName}`,
      token,
    });

  } catch (error) {
    res.status(500).json({ message: "Error in login", error: error.message });
  }
};

//create user profile
// exports.createProfile = async (req, res)=>{
//     try {
//         const {fullName, bio, phoneNumber, address, profilePhoto} = req.body
//         //check if user profle exists
//         const ProfielExist = await userProfile.create({fullName, bio, phoneNumber, address, profilePhoto})
//         res.status(201).json({
//             message: "Profile created successfully", ProfielExist
//         })

//     } catch (error) {
//         res.status(400).json({message: "Error in creating profile, error: error.message"})
//     }
// }

// register update user
// exports.updateUser = async (req, res)=>{
//     try {
//         const {avatar, phoneNumber, fullName, email} = req.body
//         //find user by id and update 
//         const updateUser = await userModel.findByIdAndUpdate(req.params.id, {avatar, phoneNumber, fullName, email}, {new: true}) // return the updated user
//         //check if user exists
//         if (!updateUser) {
//             return res.status(404).json({message: "User not found"})
//         }
//         //success response
//         res.status(200).json({
//             message: "Profile updated successfully", updateUser
//         })
//     } catch (error) {
//         res.status(400).json({
//             message: "Erro updating profile", error:message
//         })
//     }
// }



exports.getAllUsers = async(req, res)=>{
    try {
        const getAll = await userModel.find();
        if(getAll.length === 0){
            res.status(404).json({message: "No user found"})
        }
        res.status(200).json({
            message: "All users retrieved successfully", getAll
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            message: "Error in getting users"
        })
    }
}


//update user profile
exports.updateUser = async (req, res) => {
  try {
    let avatarUrl;

    if (req.file && req.file.path) {
      try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        avatarUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.log("Cloudinary upload error:", uploadError);
      }
    }

    const { phoneNumber, fullName, email } = req.body;

    const updateData = {};

    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (avatarUrl) updateData.avatar = avatarUrl;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser
    });

    console.log("BODY:", req.body);

  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Error updating profile",
      error: error.message
    });
  }
};



//get user profile
exports.getUserProfile = async(req, res)=>{
    try {
        const userId = req.params.id;
        const userProfile = await userModel.findOne({_id: userId})
        if (!userProfile) {
            res.status(404).json({message: "No user profile found"})
        }
        return res.status(200).json({userProfile})
    } catch (error) {
        res.status(400).json({message: "Error in getting users profile"})
    }
}


//Wallet Creation & Balance Retrieval using OnePipe
exports.createWallet = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if wallet already exists
        const existing = await walletModel.findOne({ userId });
        if (existing) {
            return res.status(400).json({ message: "Wallet already created" });
        }

        let wallet; // Declare here so both mock + real can use it

        // MOCK MODE
        if (!process.env.ONEPIPE_API_KEY) {
            const fakeWalletId = "wallet_" + Date.now();

            wallet = await walletModel.create({
                userId,
                walletId: fakeWalletId,
            });

            return res.status(201).json({
                message: "Wallet created successfully in mock mode",
                wallet,
            });
        }

        // REAL MODE
        const response = await onepipe.post("/wallet/create", {
            customerId: userId,
        });

        wallet = await walletModel.create({
            userId,
            walletId: response.data.walletId,
        });

        return res.status(201).json({
            message: "Wallet created successfully",
            wallet,
        });

    } catch (error) {
        console.error(error);
        res.status(400).json({ message: "Error in creating wallet" });
    }
};