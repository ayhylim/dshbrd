const jwt = require("jsonwebtoken");
const User = require("../models/User");

const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({
            msg: "Bad request. Please add email and password in the request body"
        });
    }

    let foundUser = await User.findOne({email: req.body.email});
    if (foundUser) {
        const isMatch = await foundUser.comparePassword(password);

        if (isMatch) {
            const token = jwt.sign(
                {id: foundUser._id, name: foundUser.name, role: foundUser.role}, // tambahkan role di payload
                process.env.JWT_SECRET,
                {expiresIn: "30d"}
            );

            return res.status(200).json({msg: "user logged in", token});
        } else {
            return res.status(400).json({msg: "Bad password"});
        }
    } else {
        return res.status(400).json({msg: "Bad credentails"});
    }
};

const dashboard = async (req, res) => {
    const luckyNumber = Math.floor(Math.random() * 100);

    res.status(200).json({
        msg: `Hello, ${req.user.name}`,
        secret: `Here is your authorized data, your lucky number is ${luckyNumber}`
    });
};

const getAllUsers = async (req, res) => {
    let users = await User.find({});

    return res.status(200).json({users});
};

const register = async (req, res) => {
    console.log(req.body);
    console.log("📩 Data yang diterima:", req.body); // ADD THIS
    console.log("👤 Role value:", req.body.role); // ADD THIS
    let foundUser = await User.findOne({email: req.body.email});
    if (foundUser === null) {
        let {username, email, password, role} = req.body; // tambah role
        if (username && email && password && role) {
            const person = new User({
                name: username,
                email: email,
                password: password,
                role: role // tambahkan field role
            });
            await person.save();
            return res.status(201).json({person});
        } else {
            return res.status(400).json({msg: "Please add all values in the request body"});
        }
    } else {
        return res.status(400).json({msg: "Email already in use"});
    }
};

module.exports = {
    login,
    register,
    dashboard,
    getAllUsers
};
