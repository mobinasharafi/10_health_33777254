// Quick Wellness Check
// Likelihood estimates only. Not medical advice.
console.log('WELLNESS ROUTES LOADED');

const express = require('express');
const router = express.Router();

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
    return keys.every(k => reqBody[k] !== undefined && reqBody[k] !== null && reqBody[k] !== "");
}

router.get('/wellness', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/usr/455/login');
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

router.post('/wellness', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/usr/455/login');
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

    // Track if each questionnaire was fully answered
    const completion = {};
    Object.keys(sections).forEach(key => {
        completion[key] = isComplete(req.body, sections[key]);
    });

    const overallComplete = Object.values(completion).every(Boolean);

    // Only compute a percent if that section is complete, otherwise return null
    const results = {
        iron: completion.iron ? calcPercent(sections.iron.map(k => v(k))) : null,
        vitd: completion.vitd ? calcPercent(sections.vitd.map(k => v(k))) : null,
        b12: completion.b12 ? calcPercent(sections.b12.map(k => v(k))) : null,
        dehydration: completion.dehydration ? calcPercent(sections.dehydration.map(k => v(k))) : null,
        sleep: completion.sleep ? calcPercent(sections.sleep.map(k => v(k))) : null,
        stress: completion.stress ? calcPercent(sections.stress.map(k => v(k))) : null,
        magnesium: completion.magnesium ? calcPercent(sections.magnesium.map(k => v(k))) : null,
        thyroid: completion.thyroid ? calcPercent(sections.thyroid.map(k => v(k))) : null,
        sugar: completion.sugar ? calcPercent(sections.sugar.map(k => v(k))) : null,
        immune: completion.immune ? calcPercent(sections.immune.map(k => v(k))) : null
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
