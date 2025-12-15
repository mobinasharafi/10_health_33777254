// This file handles the Dietary Approach Explorer feature.
// It suggests suitable diet approaches based on goal, BMI, and preferences.

const express = require('express');
const router = express.Router();
const db = require('../config/db');
const diets = require('../data/diets');

// Checks whether the user's goal is one of the standard supported ones
function isStandardGoal(goal) {
    return [
        "Weight gain",
        "Weight loss",
        "Improve overall health/fitness",
        "Building a better physique"
    ].includes(goal);
}

// Providing polite feedback when a diet suggestion would be inappropriate
function getBlockedMessage(goal, bmiCategory) {
    if (!goal || !bmiCategory) return null;

    const underweight = bmiCategory.includes("Underweight");
    const overweight = bmiCategory.includes("Overweight") || bmiCategory.includes("Obesity");

    if (underweight && goal === "Weight loss") {
        return "Based on your BMI category, you are currently considered underweight, so weight-loss diet approaches are not appropriate.";
    }

    if (overweight && goal === "Weight gain") {
        return "Based on your BMI category, weight-gain diet approaches may not be appropriate at this time.";
    }

    return null;
}

// Converts height & weight into BMI category (used for logged-out users)
function calculateBmiCategory(heightCm, weightKg) {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obesity";
}

// Scores how well a diet matches the user's goal and preferences
function scoreDiet(diet, goal, prefs) {
    let score = 0;

    // Core goal match (more impactful than preferences)
    if (diet.goals.includes(goal)) score += 5;

    // Enjoys plant-heavy meals
    if (prefs.vegetarian && ["mediterranean", "plant_based", "dash"].includes(diet.key)) {
        score += 2;
    }

    // Feels better eating meat regularly
    if (prefs.meat && ["high_protein", "keto", "paleo", "clean_eating", "bulking"].includes(diet.key)) {
        score += 2;
    }

    // Has a sweet tooth (flexible diets cope better)
    if (prefs.sweet) {
        if (["mediterranean", "zone"].includes(diet.key)) score += 1;
        if (diet.key === "keto") score -= 1;
    }

    // Craves filling, hearty meals
    if (prefs.hearty && ["high_protein", "bulking", "mass_gainer", "paleo"].includes(diet.key)) {
        score += 2;
    }

    // Prefers light meals
    if (prefs.light && ["mediterranean", "plant_based", "dash", "intermittent_fasting"].includes(diet.key)) {
        score += 2;
    }

    // Enjoys eating the same things often
    if (prefs.routine && ["keto", "clean_eating", "zone", "high_protein"].includes(diet.key)) {
        score += 1;
    }

    // Needs variety
    if (prefs.variety) {
        if (["mediterranean", "dash", "plant_based"].includes(diet.key)) score += 1;
        if (["keto", "clean_eating"].includes(diet.key)) score -= 1;
    }

    // Eats for fuel more than pleasure
    if (prefs.fuel && ["high_protein", "clean_eating", "zone", "cutting"].includes(diet.key)) {
        score += 1;
    }

    return score;
}

// Show the diet explorer page
router.get('/diet', async (req, res) => {
    let user = null;

    if (req.session.userId) {
        const [rows] = await db.query(
            "SELECT goal, bmi_category FROM users WHERE id = ?",
            [req.session.userId]
        );
        user = rows[0] || null;
    }

    res.render('diet', {
        session: req.session,
        user,
        needsGoalChoice: user && !isStandardGoal(user.goal),
        suggestions: null,
        blockedMessage: null,
        prefs: {}
    });
});

// Handle form submission and show results on the same page
router.post('/diet', async (req, res) => {
    let user = null;
    let bmiCategory = null;

    if (req.session.userId) {
        const [rows] = await db.query(
            "SELECT goal, bmi_category FROM users WHERE id = ?",
            [req.session.userId]
        );
        user = rows[0] || null;
        bmiCategory = user?.bmi_category;
    } else {
        // Logged-out users: calculate BMI from submitted height & weight
        const height = Number(req.body.height_cm);
        const weight = Number(req.body.weight_kg);

        if (height && weight) {
            bmiCategory = calculateBmiCategory(height, weight);
        }
    }

    // Decide which goal to use for suggestions
    const effectiveGoal =
        user && !isStandardGoal(user.goal)
            ? req.body.goal_override
            : user?.goal || req.body.goal_override;

    // Read preference flags from the form
    const prefs = {
        vegetarian: !!req.body.vegetarian,
        meat: !!req.body.meat,
        sweet: !!req.body.sweet,
        hearty: !!req.body.hearty,
        light: !!req.body.light,
        routine: !!req.body.routine,
        variety: !!req.body.variety,
        fuel: !!req.body.fuel
    };

    const blockedMessage = getBlockedMessage(effectiveGoal, bmiCategory);
    if (blockedMessage) {
        return res.render('diet', {
            session: req.session,
            user,
            needsGoalChoice: !user,
            suggestions: null,
            blockedMessage,
            prefs
        });
    }

    const suggestions = Object.values(diets)
        .map(d => ({ ...d, score: scoreDiet(d, effectiveGoal, prefs) }))
        .filter(d => d.goals.includes(effectiveGoal))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    res.render('diet', {
        session: req.session,
        user,
        needsGoalChoice: user && !isStandardGoal(user.goal),
        suggestions,
        blockedMessage: null,
        prefs
    });
});

module.exports = router;