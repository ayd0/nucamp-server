const express = require("express");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorite = require("../models/favorite");
const favoriteRouter = express.Router();

favoriteRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate("user")
            .populate("campsite")
            .then((favorites) => {
                console.log(favorites);
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
            })
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite) {
                    for (campsite of req.body) {
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite);
                        }
                    }
                    favorite.save();
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                } else {
                    Favorite.create({
                        user: req.user._id,
                        campsites: req.body,
                    }).then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorite);
                    });
                }
            })
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const err = new Error(`PUT request not supported on route: /favorites`);
        err.statusCode = 403;
        return next(err);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
            .then((favorite) => {
                res.statusCode = 200;
                if (favorite) {
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                } else {
                    res.setHeader("Content-Type", "text/plain");
                    res.end("You do not have any favorites to delete!");
                }
            })
            .catch((err) => next(err));
    });

favoriteRouter
    .route("/:campsiteId")
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        const err = new Error(`PUT request not supported on route: /favorites`);
        err.statusCode = 403;
        return next(err);
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id }).then((favorite) => {
            if (!favorite.campsites.includes(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save();

                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end("The campsite is already in the list of favorites!");
            }
        })
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        const err = new Error(`PUT request not supported on route: /favorites`);
        err.statusCode = 403;
        return next(err);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id }).then((favorite) => {
            if (favorite) {
                if (favorite.campsites.includes(req.params.campsiteId)) {
                    favorite.campsites.splice(
                        favorite.campsites.indexOf(req.params.campsiteId),
                        1
                    );
                    favorite.save();

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                } else {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/plain");
                    res.end(
                        `Campsite: ${req.params.campsiteId} does not exist in Favorite: ${favorite._id}`
                    );
                }
            } else {
                res.statusCode = 200;
                res.setHeader("Content-Type", "text/plain");
                res.end("There are no favorites to delete");
            }
        })
        .catch((err) => next(err));
    });

module.exports = favoriteRouter;
