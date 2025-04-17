const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const Users = require("../models/User");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const auth = require("../middlewares/auth.js");

const userSchema = Joi.object({
  name: Joi.object({
    first: Joi.string().min(2).required(),
    middle: Joi.string().allow(""),
    last: Joi.string().min(1).required(),
  }),
  isBusiness: Joi.boolean().required(),
  isAdmin: Joi.boolean(),
  phone: Joi.string()
    .required()
    .min(9)
    .max(10)
    .pattern(/^05\d{8,9}$/)
    .message(
      "The phone number must be an Israeli phone number starting with 05 and max digits is 9-10 "
    ),
  email: Joi.string().email().min(2).required(),
  password: Joi.string().min(8).max(20).required(),
  address: Joi.object({
    state: Joi.string().min(2).allow(""),
    country: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    street: Joi.string().min(2).required(),
    houseNumber: Joi.number().required(),
    zip: Joi.number().required(),
  }),
  image: Joi.object({
    url: Joi.string()
      .default(
        "https://plus.unsplash.com/premium_photo-1683121366070-5ceb7e007a97?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D"
      )
      .allow("")
      .optional(),
    alt: Joi.string().default("profile").allow("").optional(),
  }).optional(),
});

// register new user
router.post("/", async (req, res) => {
  try {
    // validate Schema
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if user exists
    let user = await Users.findOne({ email: req.body.email });
    if (user) return res.status(400).send("this user is exists");

    // generate the salt and hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    // register the user
    user = new Users({ ...req.body, password: hashedPass });

    // save the user on database
    await user.save();

    // generate the token
    const token = jwt.sign(
      _.pick(user, [
        "_id",
        "name.first",
        "name.last",
        "email",
        "isAdmin",
        "isBusiness",
      ]),
      process.env.JWT_SECRET
    );

    // return user token
    res.status(201).send(token);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const loginSchema = Joi.object({
  email: Joi.string().email().min(2).required(),
  password: Joi.string().min(8).max(20).required(),
});

// login
router.post("/login", async (req, res) => {
  try {
    // validate login body
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // check if user exist
    const user = await Users.findOne({ email: req.body.email });

    // if user not exixst
    if (!user) {
      console.log("invalid email or password please try again");
      return res.status(400).send("invalid email or password please try again");
    }
    //if user found compare the password
    const userPassword = await bcrypt.compare(req.body.password, user.password);

    // if the password is invalid
    if (!userPassword) {
      console.log("invalid email or password please try again");
      return res.status(400).send("invalid email or password please try again");
    }

    user.loginStamp.push(new Date().toLocaleString());
    await user.save();

    // set token and send it to user
    const token = jwt.sign(
      _.pick(user, [
        "_id",
        "name.first",
        "name.last",
        "email",
        "isAdmin",
        "isBusiness",
      ]),
      process.env.JWT_SECRET
    );

    res.status(200).send(token);
  } catch (error) {
    // if the login has any error
    console.log("An error occurred during login", error);
    res.status(400).send(error);
  }
});

// get all users for admin
router.get("/", auth, async (req, res) => {
  try {
    // check admin role
    if (!req.payload.isAdmin) return res.status(401).send("Access denied.");

    // find the user
    const users = await Users.find({}, { password: 0 });
    if (!users) return res.status(404).send("no users found ");

    // return the user
    res.status(200).send(users);
  } catch (error) {
    console.log(error.message);
    res.status(400).send(error);
  }
});

// get user by id
router.get("/:userId", auth, async (req, res) => {
  try {
    // check admin role
    if (!req.payload.isAdmin || req.payload._id !== req.params.userId)
      return res.status(401).send("Access denied.");

    // find the user
    const user = await Users.findOne(
      { _id: req.params.userId },
      { password: 0 }
    );
    if (!user) return res.status(404).send("No user found ");

    // return the user
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// delete user by id
router.delete("/:userId", auth, async (req, res) => {
  try {
    if (req.params.userId != req.payload._id || !req.payload.isAdmin)
      return res
        .status(401)
        .send("You do not have permission to delete this user");

    // find the user in the database
    const user = await Users.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).send("User not found");

    // Send success response
    res.status(200).send("user deleted successfully");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// update user by id
router.put("/:userId", auth, async (req, res) => {
  try {
    // check if user admin or woner to update this user
    if (!req.payload.isAdmin && req.params.userId !== req.payload._id)
      return res
        .status(401)
        .send("You don't have permission to update this user");

    // validate the body
    const { error } = userSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // find and update the user
    const user = await Users.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    }).select("-password");

    if (!user) return res.status(405).send("User not found");

    // return the user with new updates
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// change business status
router.patch("/:userId", auth, async (req, res) => {
	try {
		// Check if the user is authorized to edit their profile
		if (req.payload._id !== req.params.id && !req.payload.isAdmin)
			return res.status(401).send("Unauthorized");

		// find the user
		const user = await Users.findOneAndUpdate(
			{_id: req.params.id},
			{$set: {isBusiness: !req.body.isBusiness}},
			{new: true},
		);
		if (!user) return res.status(404).send("User not found");

		// send the result status
		res.status(200).send(
			`your business account status is: ${user.isBusiness ? "Business" : "Client"}`,
		);
	} catch (error) {
		res.status(400).send(error);
	}
});

module.exports = router;
