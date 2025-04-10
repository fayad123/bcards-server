const express = require("express");
const router = express.Router();
const Joi = require("joi");
const Cards = require("../models/Card");
const auth = require("../middlewares/auth");

const cardSchema = Joi.object({
  _id: Joi.string(),
  title: Joi.string().required(),
  subtitle: Joi.string().required(),
  description: Joi.string().optional(),
  phone: Joi.string()
    .min(9)
    .max(10)
    .required()
    .regex(/^05\d{8,9}$/),
  email: Joi.string().email().min(5).required(),
  web: Joi.string().optional().allow(""),
  image: Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().required(),
  }),
  address: Joi.object({
    state: Joi.string().allow("").default("not defined"),
    country: Joi.string().min(2).required(),
    city: Joi.string().min(2).required(),
    street: Joi.string().min(2).required(),
    houseNumber: Joi.number().required(),
    zip: Joi.string().default("00000"),
  }),
  bizNumber: Joi.number(),
  likes: Joi.array().items(Joi.string()),
  user_id: Joi.string(),
  __v: Joi.number().optional(),
});

router.post("/", auth, async (req, res) => {
  try {
    // chech if the user is admin or business or not
    if (!(req.payload.isBusiness || req.payload.isAdmin)) {
      console.log(chalk.red("Only business or admin accounts can add cards"));
      return res.status(403).send("just business or admin users can add cards");
    }
    const { error } = cardSchema.validate(req.body);
    if (error) return res.status(400).send(error);

    // check if the card is exists
    let card = await Cards.findOne({ email: req.body.email });
    if (card) return res.status(400).send("this card is exists");

    // create the card
    card = new Cards({ ...req.body, user_id: req.payload._id });

    // save the card on database
    await card.save();

    // return the status 200 with card
    res.status(200).send(card);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
