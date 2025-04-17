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
    if (!req.payload.isBusiness && !req.payload.isAdmin) {
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

router.get("/", async (req, res) => {
  try {
    const cards = await Cards.find();

    if (!cards) return res.status(404).send("no cards available");

    res.status(200).send(cards);
  } catch (error) {
    res.status(400).send(error);
  }
});

// get card by id
router.get("/:cardId", async (req, res) => {
  try {
    const cards = await Cards.findOne({ _id: req.params.cardId });

    if (!cards) return res.status(404).send("no cards available");

    res.status(200).send(cards);
  } catch (error) {
    res.status(400).send(error);
  }
});

// delete card by id
router.delete("/:cardId", async (req, res) => {
  try {
    const cardToDelete = await Cards.findOneAndDelete({
      _id: req.params.cardId,
    });
    if (!cardToDelete) res.status(404).send("Card not Found");
    res.status(200).send("card deleted successfully");
  } catch (error) {
    res.status(400).send(error);
  }
});

// update card by id
router.put("/:cardId", auth, async (req, res) => {
  try {
    // find card
    const card = await Cards.findById(req.params.id);
    if (!card) return res.status(404).send("User not found");

    // check if user cave permission to update the card
    if (card.user_id !== req.payload._id && !req.payload.isAdmin)
      return res.status(401).send("owner or admin users can update this card");

    // check body validation
    const { error } = cardSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // get the userCard and update
    let userCardToUpdae = await Cards.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!userCardToUpdae) return res.status(404).send("Card not found");

    // return the card
    res.status(200).send(userCardToUpdae);
  } catch (error) {
    res.status(400).send(error);
  }
});

// patch like status
router.patch("/:cardId", auth, async (req, res) => {
  try {
    // Check if the user is authorized to edit their profile
    if (!req.payload._id) return res.status(401).send("Unauthorized");

    let card = await Cards.findOne({ _id: req.params.cardId });
    if (!card) return res.status(400).send("card not found");

    // Check if the user has already liked the card
    const isLiked = card.likes.includes(req.payload._id);

    // if userId is include in likes array remove the userId
    if (isLiked) {
      card.likes = card.likes.filter((like) => like !== req.payload._id);
    } else {
      // if user id not in the likes add it on
      card.likes.push(req.payload._id);
    }

    // updated card
    await card.save();

    // terusrn the card
    res.status(200).send(card);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
