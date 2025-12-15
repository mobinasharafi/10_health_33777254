// This file contains data about various diet approaches.
// It is used by the Dietary Approach Explorer feature to suggest diets based on user goals, BMI, and preferences.
// Each diet has a clear description and an external link for further reading.

module.exports = {
    mediterranean: {
        key: "mediterranean",
        name: "Mediterranean Diet",
        goals: ["Improve overall health/fitness", "Weight loss"],
        description:
            "A balanced, heart-focused way of eating inspired by traditional Mediterranean countries. It emphasises whole foods, healthy fats, and long-term sustainability rather than restriction.",
        link: "https://my.clevelandclinic.org/health/articles/16037-mediterranean-diet"
    },

    high_protein: {
        key: "high_protein",
        name: "High-Protein Diet",
        goals: ["Weight loss", "Building a better physique"],
        description:
            "A diet that prioritises protein intake to support muscle maintenance, satiety, and metabolic health. Often used for body recomposition and fat loss.",
        link: "https://www.webmd.com/diet/ss/slideshow-high-protein-diet"
    },

    ketogenic: {
        key: "ketogenic",
        name: "Ketogenic Diet",
        goals: ["Weight loss"],
        description:
            "A very low-carbohydrate, high-fat diet designed to shift the body into ketosis, where fat is used as the primary fuel source.",
        link: "https://www.healthline.com/nutrition/ketogenic-diet-101"
    },

    paleo: {
        key: "paleo",
        name: "Paleo Diet",
        goals: ["Improve overall health/fitness", "Building a better physique"],
        description:
            "A diet based on foods thought to be eaten by early humans, focusing on minimally processed whole foods while avoiding modern refined products.",
        link: "https://thepaleodiet.com/"
    },

    cutting: {
        key: "cutting",
        name: "Calorie Deficit (Cutting) Diet",
        goals: ["Weight loss"],
        description:
            "A structured eating approach designed to reduce body fat while preserving muscle by maintaining a controlled calorie deficit.",
        link: "https://www.healthline.com/nutrition/cutting-diet"
    },

    intermittent_fasting: {
        key: "intermittent_fasting",
        name: "Intermittent Fasting",
        goals: ["Weight loss", "Improve overall health/fitness"],
        description:
            "An eating pattern that cycles between periods of eating and fasting, focusing more on timing than specific foods.",
        link: "https://www.healthline.com/nutrition/16-8-intermittent-fasting"
    },

    plant_based: {
        key: "plant_based",
        name: "Plant-Based / Vegan Diet",
        goals: ["Improve overall health/fitness", "Weight loss"],
        description:
            "A diet centred around plant foods, minimising or excluding animal products, often chosen for health, ethical, or environmental reasons.",
        link: "https://www.everydayhealth.com/diet-nutrition/plant-based-diet-food-list-sample-menu/"
    },

    low_carb: {
        key: "low_carb",
        name: "Low-Carb Diet",
        goals: ["Weight loss"],
        description:
            "A dietary approach that reduces carbohydrate intake to help stabilise blood sugar levels and encourage fat utilisation.",
        link: "https://www.healthline.com/nutrition/low-carb-diet-meal-plan-and-menu"
    },

    dash: {
        key: "dash",
        name: "DASH Diet",
        goals: ["Improve overall health/fitness"],
        description:
            "A diet originally developed to support heart health and blood pressure management through balanced, nutrient-dense eating.",
        link: "https://www.42kingsway.nhs.uk/services/hypertension-diet-dash/"
    },

    zone: {
        key: "zone",
        name: "Zone Diet",
        goals: ["Improve overall health/fitness", "Weight loss"],
        description:
            "A structured diet that balances macronutrients in specific ratios to support metabolic stability and reduce inflammation.",
        link: "https://www.healthline.com/nutrition/zone-diet"
    },

    clean_eating: {
        key: "clean_eating",
        name: "Bodybuilder / Clean Eating Diet",
        goals: ["Building a better physique"],
        description:
            "A disciplined eating style focused on whole, minimally processed foods to support muscle growth, recovery, and performance.",
        link: "https://www.muscleandstrength.com/diet-plans/clean-eating-diet"
    },

    bulking: {
        key: "bulking",
        name: "Calorie Surplus (Bulking) Diet",
        goals: ["Weight gain", "Building a better physique"],
        description:
            "A structured calorie-surplus approach designed to promote muscle gain alongside controlled weight increase.",
        link: "https://bonytobeastly.com/bulking-diet-guide/"
    },

    mass_gainer: {
        key: "mass_gainer",
        name: "Mass Gainer Diet",
        goals: ["Weight gain"],
        description:
            "A high-calorie eating strategy aimed at individuals who struggle to gain weight, prioritising energy-dense intake.",
        link: "https://www.australianeggs.org.au/nutrition/meal-plans/weight-gain-meal-plan"
    },

    high_carb: {
        key: "high_carb",
        name: "High-Carb Performance Diet",
        goals: ["Weight gain"],
        description:
            "A carbohydrate-focused diet designed to support training performance, recovery, and energy demands.",
        link: "https://www.healthline.com/nutrition/12-healthy-high-carb-foods"
    }
};
