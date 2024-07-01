const express = require('express');
const router = express.Router();
const { check, body, validationResult } = require('express-validator');

// Sentence Model
let Sentence = require('../models/sentence');

let totalCharacterCount = 0;
let totalLowerCaseAlphabetsCount = 0;
let totalUpperCaseAlphabetsCount = 0;
let totalNonAlphabeticCharactersCount = 0;

function removeChars(sentence) {
    let givenSentence = sentence.body;
    totalCharacterCount -= sentence.body.length;
    totalLowerCaseAlphabetsCount -= (givenSentence.match(/[A-Z]/g) || []).length;
    totalUpperCaseAlphabetsCount -= (givenSentence.match(/[a-z]/g) || []).length;
    totalNonAlphabeticCharactersCount -= (givenSentence.match(/[0-9\W_]+/i) || []).length;
}

function addChars(sentence) {
    let givenSentence = sentence.body;
    totalCharacterCount += sentence.body.length;
    totalLowerCaseAlphabetsCount += (givenSentence.match(/[A-Z]/g) || []).length;
    totalUpperCaseAlphabetsCount += (givenSentence.match(/[a-z]/g) || []).length;
    totalNonAlphabeticCharactersCount += (givenSentence.match(/[0-9\W_]+/i) || []).length;
}

function backToZero() {
    totalCharacterCount = totalLowerCaseAlphabetsCount = totalUpperCaseAlphabetsCount = totalNonAlphabeticCharactersCount = 0;
}

// Home Route for all sentences 
router.get('/dashboard', function (req, res) {
    Sentence.find()
        .exec()
        .then(sentences => {
            if (sentences.length == 0) {
                backToZero();
            }
            res.render('dashboard', {
                title: 'Dashboard',
                totalSentencesCount: sentences.length,
                totalCharacterCount: totalCharacterCount,
                totalUpperCaseAlphabetsCount: totalLowerCaseAlphabetsCount,
                totalLowerCaseAlphabetsCount: totalUpperCaseAlphabetsCount,
                totalNonAlphabeticCharactersCount: totalNonAlphabeticCharactersCount
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// Add Route
router.get('/add', ensureAuthenticated, function (req, res) {
    res.render('add_sentence', {
        title: 'Add Sentence'
    });
});

// report Route
router.get('/report', ensureAuthenticated, function (req, res) {
    Sentence.find()
        .exec()
        .then(sentences => {
            res.render('report', {
                title: 'Sentences Report',
                sentences: sentences
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// Add Submit POST Route
router.post('/add', [
    check('title', 'Title is required').notEmpty(),
    body('body', 'Body is required').notEmpty(),
    body('body', 'Body Max limit is 50').isLength({ max: 50 }),
    body('body', 'Body Min limit is 10').isLength({ min: 10 }),
    body('body', 'Body should contain atleast one space').contains(' ')], function (req, res) {

        // Get Errors
        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('add_sentence', {
                title: 'Add Sentence',
                errors: errors.array()
            });
        } else {
            let sentence = new Sentence();
            sentence.title = req.body.title;
            sentence.author = req.user._id;
            sentence.body = req.body.body;
            sentence
                .save()
                .then(() => {
                    req.flash('success', 'Sentence Added');
                    res.redirect('/');
                    addChars(sentence);
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        }
    });

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function (req, res) {
    Sentence.findById(req.params.id, function (err, sentence) {
        if (sentence.author != req.user._id) {
            req.flash('danger', 'Not Authorized');
            return res.redirect('/');
        }
        res.render('edit_sentence', {
            title: 'Edit Sentence',
            sentence: sentence
        });
    });
});

// Update Sentence
router.post('/edit/:id', [
    check('title', 'Title is required').notEmpty(),
    body('body', 'Body is required').notEmpty(),
    body('body', 'Body Max limit is 50').isLength({ max: 50 }),
    body('body', 'Body Min limit is 10').isLength({ min: 10 }),
    body('body', 'Body should contain atleast one space').contains(' ')], function (req, res) {

        let errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.render('edit_sentence', {
                title: 'Edit Sentence',
                errors: errors.array()
            });
        } else {
            let query = { _id: req.params.id }
            Sentence.findById(query).exec()
                .then(sentence => {
                    removeChars(sentence);
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            let sentence = {};
            sentence.title = req.body.title;
            sentence.body = req.body.body;
            Sentence
                .findByIdAndUpdate(query, sentence)
                .exec()
                .then(() => {
                    req.flash('success', 'Sentence Updated');
                    res.redirect('/');
                    addChars(sentence);
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
        }
    });

// Delete Sentence
router.delete('/:id', function (req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }

    let query = { _id: req.params.id }
    Sentence.findById(query).exec()
        .then(sentence => {
            removeChars(sentence);
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
    Sentence.findByIdAndDelete(query)
        .exec()
        .then(() => {
            req.flash('success', 'Sentence Deleted');
            res.send('Success');
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

// Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;
