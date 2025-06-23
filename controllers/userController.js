const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const registerUser =async(req,res) =>{
const {name,email,password} = req.body
    try {
    const userExits = await User.findOne({ email: req.body.email });
      if (userExits) {
        return res
          .status(200)
          .send({ message: "User already exits", success: false });
      }
        const newUser =  new User({name,email,password})
        await newUser.save();
        res.status(200).send({message:"User registered successfully", success:true})
    } catch (error) {
        res.status(500).send({error:error})
    }
}

const LoginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const loggedInUser = await User.findOne({ email, password }); // 🔴 Ideally, you should hash and compare passwords securely

    if (!loggedInUser) {
      return res.status(401).send({ success: false, error: "Invalid credentials" });
    }

    const userPayload = {
      _id: loggedInUser._id,
      name: loggedInUser.name,
      isAdmin: loggedInUser.isAdmin,
      email: loggedInUser.email
    };

    const token = jwt.sign(userPayload, process.env.SECREATE_KEY, {
      expiresIn: "2h",
    });

    res.status(200).send({
      success: true,
      message: "User logged in successfully",
      token: token,
      user: userPayload
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send({ success: false, error: "Internal Server Error" });
  }
};

const getUserInfo =async (req,res) =>{
    console.log("req.user",req.user)
    try {

        loggedUser = await User.findOne({_id:req.user._id},{password:0, __v:0, createdAt:0})
res.status(200).send({message:"got user info",loggedUser:loggedUser})
            
    } catch (error) {
        res.status(500).send({error:error})
        
    }
}
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0 }); // Exclude password
    res.status(200).send({ message: "All users fetched", success: true, users });
  } catch (error) {
    res.status(500).send({ message: "Error fetching users", error });
  }
};
const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, select: "-password -__v" }
    );

    res.status(200).send({
      message: "User profile updated",
      success: true,
      updatedUser,
    });
  } catch (error) {
    res.status(500).send({ message: "Error updating profile", error });
  }
};
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndDelete(userId);

    res.status(200).send({ message: "User deleted successfully", success: true });
  } catch (error) {
    res.status(500).send({ message: "Error deleting user", error });
  }
};

module.exports = {
    registerUser,
    LoginUser,
    getUserInfo,
    getAllUsers ,
    updateUserProfile ,
    deleteUser
}