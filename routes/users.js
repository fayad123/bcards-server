const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const Users = require("../models/User");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

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

module.exports = router;
