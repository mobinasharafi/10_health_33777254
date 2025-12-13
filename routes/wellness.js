// This file contains all routes related to the Quick Wellness Check feature.
// It allows the user to complete short questionnaires and view likelihood results.
// Likelihood estimates only. Not medical advice.
const express = require('express');
const router = express.Router();

// Helper functions
function clampPercent(n) {
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
}

function calcPercent(values) {
    const total = values.reduce((a, b) => a + b, 0);
    const max = values.length * 3;
    return clampPercent(Math.round((total / max) * 100));
}

function isComplete(reqBody, keys) {
    return keys.every(k => reqBody[k] !== undefined && reqBody[k] !== "");
}


// wellness check form route
router.get('/wellness', (req, res) => {

    // Logged-in users should not access the public wellness check
    if (req.session.userId) {
        return res.redirect('/');
    }

    res.render('wellness', {
        answers: {},
        results: null,
        completion: null,
        singleResult: null,
        overallComplete: false,
        session: req.session
    });
});


// Form submission handler
router.post('/wellness', (req, res) => {

    // Logged-in users should not submit the public wellness check
    if (req.session.userId) {
        return res.redirect('/');
    }

    const v = (name) => Number(req.body[name] ?? 0);
    const action = req.body.action;

    const sections = {
        iron: ['iron1', 'iron2', 'iron3', 'iron4', 'iron5'],
        vitd: ['vitd1', 'vitd2', 'vitd3', 'vitd4', 'vitd5'],
        b12: ['b121', 'b122', 'b123', 'b124', 'b125'],
        dehydration: ['dehy1', 'dehy2', 'dehy3', 'dehy4', 'dehy5'],
        sleep: ['sleep1', 'sleep2', 'sleep3', 'sleep4', 'sleep5'],
        stress: ['stress1', 'stress2', 'stress3', 'stress4', 'stress5'],
        magnesium: ['mag1', 'mag2', 'mag3', 'mag4', 'mag5'],
        thyroid: ['thy1', 'thy2', 'thy3', 'thy4', 'thy5'],
        sugar: ['sugar1', 'sugar2', 'sugar3', 'sugar4', 'sugar5'],
        immune: ['imm1', 'imm2', 'imm3', 'imm4', 'imm5']
    };

    // Track completion per section
    const completion = {};
    Object.keys(sections).forEach(key => {
        completion[key] = isComplete(req.body, sections[key]);
    });

    const overallComplete = Object.values(completion).every(Boolean);

    // Calculate results only if complete
    const results = {
        iron: completion.iron ? calcPercent(sections.iron.map(v)) : null,
        vitd: completion.vitd ? calcPercent(sections.vitd.map(v)) : null,
        b12: completion.b12 ? calcPercent(sections.b12.map(v)) : null,
        dehydration: completion.dehydration ? calcPercent(sections.dehydration.map(v)) : null,
        sleep: completion.sleep ? calcPercent(sections.sleep.map(v)) : null,
        stress: completion.stress ? calcPercent(sections.stress.map(v)) : null,
        magnesium: completion.magnesium ? calcPercent(sections.magnesium.map(v)) : null,
        thyroid: completion.thyroid ? calcPercent(sections.thyroid.map(v)) : null,
        sugar: completion.sugar ? calcPercent(sections.sugar.map(v)) : null,
        immune: completion.immune ? calcPercent(sections.immune.map(v)) : null
    };

    const singleResult =
        action && action !== 'all'
            ? {
                key: action,
                value: results[action],
                complete: completion[action]
            }
            : null;

    res.render('wellness', {
        answers: req.body,
        results: results,
        completion: completion,
        singleResult: singleResult,
        overallComplete: overallComplete,
        session: req.session
    });
});

module.exports = router;