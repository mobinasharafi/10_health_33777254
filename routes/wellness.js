// This file handles the Quick Wellness Check feature.
// It shows the questionnaires and calculates likelihood estimates
// based on the user's answers. This feature does not store data
// and works for both logged-in and logged-out users.

const express = require('express');
const router = express.Router();

// Helper function to calculate percentage likelihood from 5 questions
function calculateLikelihood(values) {
    if (values.length !== 5) return null;

    const total = values.reduce((sum, v) => sum + v, 0);
    const max = 15; // 5 questions × max score of 3
    return Math.round((total / max) * 100);
}

// Helper to extract answers safely from the request body
function getAnswers(body, keys) {
    const values = [];

    for (const key of keys) {
        if (body[key] === undefined) return null;
        values.push(parseInt(body[key], 10));
    }

    return values;
}

// Show the wellness check page
router.get('/wellness', (req, res) => {
    res.render('wellness', {
        answers: {},
        results: null,
        singleResult: null,
        overallComplete: true,
        session: req.session
    });
});

// Handle questionnaire submission
router.post('/wellness', (req, res) => {
    const action = req.body.action;

    const groups = {
        iron: ['iron1','iron2','iron3','iron4','iron5'],
        vitd: ['vitd1','vitd2','vitd3','vitd4','vitd5'],
        b12: ['b121','b122','b123','b124','b125'],
        dehydration: ['dehy1','dehy2','dehy3','dehy4','dehy5'],
        sleep: ['sleep1','sleep2','sleep3','sleep4','sleep5'],
        stress: ['stress1','stress2','stress3','stress4','stress5'],
        magnesium: ['mag1','mag2','mag3','mag4','mag5'],
        thyroid: ['thy1','thy2','thy3','thy4','thy5'],
        sugar: ['sugar1','sugar2','sugar3','sugar4','sugar5'],
        immune: ['imm1','imm2','imm3','imm4','imm5']
    };

    const results = {};
    let overallComplete = true;
    let singleResult = null;

    // Calculate all results
    for (const key in groups) {
        const values = getAnswers(req.body, groups[key]);
        if (values === null) {
            results[key] = null;
            overallComplete = false;
        } else {
            results[key] = calculateLikelihood(values);
        }
    }

    // Handle single questionnaire action
    if (action !== 'all') {
        const values = getAnswers(req.body, groups[action]);

        singleResult = {
            key: action,
            complete: values !== null,
            value: values ? calculateLikelihood(values) : null
        };
    }

    res.render('wellness', {
        answers: req.body,
        results: action === 'all' ? results : null,
        singleResult,
        overallComplete,
        session: req.session
    });
});

module.exports = router;
