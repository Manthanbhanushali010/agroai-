/**
 * Treatment Tracking Chainlink Function
 * Monitors treatment effectiveness and provides AI-powered analysis with bonus rewards
 */

const treatmentTrackingSource = `
// Treatment Tracking Function for Effectiveness Monitoring
const cropId = args[0];
const treatmentType = args[1];
const treatmentProgress = parseInt(args[2]);
const beforeImageHash = args[3];
const afterImageHash = args[4];
const treatmentDuration = parseInt(args[5]); // days
const weatherData = args[6]; // JSON string of weather during treatment

try {
    console.log("Starting treatment effectiveness analysis...");

    // 1. Parse Weather Data
    let weatherConditions = {};
    try {
        weatherConditions = JSON.parse(weatherData);
    } catch (e) {
        weatherConditions = {
            avgTemperature: 22,
            avgHumidity: 65,
            precipitationDays: 3,
            sunlightHours: 8
        };
    }

    // 2. AI Analysis of Before/After Images
    console.log("Analyzing treatment progress...");
    const beforeAnalysis = await Functions.makeHttpRequest({
        url: "https://your-backend.com/api/analyze-treatment",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + secrets.API_KEY
        },
        data: {
            beforeImage: beforeImageHash,
            afterImage: afterImageHash,
            treatmentType: treatmentType,
            progress: treatmentProgress
        },
        timeout: 10000
    });

    let effectivenessScore = 0;
    let improvementMetrics = {};
    let diseaseStatus = "unknown";

    if (beforeAnalysis.data) {
        effectivenessScore = beforeAnalysis.data.effectivenessScore || 0;
        improvementMetrics = beforeAnalysis.data.improvementMetrics || {};
        diseaseStatus = beforeAnalysis.data.diseaseStatus || "unknown";
    }

    // 3. Treatment Effectiveness Calculation
    console.log("Calculating treatment effectiveness...");
    const treatmentEffectiveness = {
        progressScore: treatmentProgress,
        weatherCompliance: _calculateWeatherCompliance(weatherConditions, treatmentType),
        timeEfficiency: _calculateTimeEfficiency(treatmentDuration, treatmentType),
        aiEffectiveness: effectivenessScore,
        overallScore: 0
    };

    // Calculate overall effectiveness score
    treatmentEffectiveness.overallScore = (
        treatmentEffectiveness.progressScore * 0.3 +
        treatmentEffectiveness.weatherCompliance * 0.2 +
        treatmentEffectiveness.timeEfficiency * 0.2 +
        treatmentEffectiveness.aiEffectiveness * 0.3
    );

    // 4. Treatment Type Analysis
    const treatmentAnalysis = _analyzeTreatmentType(treatmentType, treatmentEffectiveness);

    // 5. Weather Impact Assessment
    const weatherImpact = _assessWeatherImpact(weatherConditions, treatmentType);

    // 6. Success Metrics
    const successMetrics = {
        diseaseReduction: treatmentProgress > 80 ? "Significant" : treatmentProgress > 50 ? "Moderate" : "Minimal",
        recoveryRate: treatmentEffectiveness.overallScore > 80 ? "Excellent" : 
                     treatmentEffectiveness.overallScore > 60 ? "Good" : 
                     treatmentEffectiveness.overallScore > 40 ? "Fair" : "Poor",
        costEffectiveness: _calculateCostEffectiveness(treatmentType, treatmentEffectiveness.overallScore),
        environmentalImpact: _assessEnvironmentalImpact(treatmentType, weatherConditions)
    };

    // 7. Bonus Reward Calculation
    console.log("Calculating bonus rewards...");
    const bonusRewards = _calculateBonusRewards(treatmentEffectiveness, successMetrics);

    // 8. Recommendations
    const recommendations = _generateRecommendations(treatmentEffectiveness, successMetrics, weatherConditions);

    // 9. Compile Treatment Report
    const treatmentReport = {
        // Treatment Analysis
        treatment: {
            type: treatmentType,
            progress: treatmentProgress,
            duration: treatmentDuration,
            effectiveness: treatmentEffectiveness,
            analysis: treatmentAnalysis
        },

        // Weather Impact
        weather: {
            conditions: weatherConditions,
            impact: weatherImpact,
            compliance: treatmentEffectiveness.weatherCompliance
        },

        // Success Metrics
        success: successMetrics,

        // Rewards
        rewards: bonusRewards,

        // Recommendations
        recommendations: recommendations,

        // Disease Status
        disease: {
            status: diseaseStatus,
            improvement: improvementMetrics
        },

        // Metadata
        metadata: {
            cropId: cropId,
            timestamp: Date.now(),
            treatmentType: treatmentType,
            beforeImage: beforeImageHash,
            afterImage: afterImageHash
        }
    };

    console.log("Treatment tracking analysis completed. Overall score:", treatmentEffectiveness.overallScore);
    return Functions.encodeString(JSON.stringify(treatmentReport));

} catch (error) {
    console.error("Treatment tracking error:", error.message);
    
    const errorReport = {
        error: true,
        message: error.message,
        timestamp: Date.now(),
        cropId: cropId,
        treatmentType: treatmentType
    };
    
    return Functions.encodeString(JSON.stringify(errorReport));
}

// Helper Functions
function _calculateWeatherCompliance(weather, treatmentType) {
    let compliance = 100;
    
    switch (treatmentType) {
        case "fungicide":
            // Fungicides work best in dry conditions
            if (weather.avgHumidity > 80) compliance -= 30;
            if (weather.precipitationDays > 5) compliance -= 20;
            break;
        case "insecticide":
            // Insecticides work best in moderate conditions
            if (weather.avgTemperature > 30) compliance -= 25;
            if (weather.avgTemperature < 10) compliance -= 25;
            break;
        case "fertilizer":
            // Fertilizers work best with moderate rain
            if (weather.precipitationDays < 2) compliance -= 20;
            if (weather.precipitationDays > 8) compliance -= 15;
            break;
        case "irrigation":
            // Irrigation effectiveness depends on temperature
            if (weather.avgTemperature > 35) compliance -= 10;
            break;
    }
    
    return Math.max(0, compliance);
}

function _calculateTimeEfficiency(duration, treatmentType) {
    const optimalDurations = {
        "fungicide": 7,
        "insecticide": 5,
        "fertilizer": 14,
        "irrigation": 3,
        "pruning": 2,
        "harvesting": 1
    };
    
    const optimal = optimalDurations[treatmentType] || 7;
    const efficiency = Math.max(0, 100 - Math.abs(duration - optimal) * 10);
    return efficiency;
}

function _analyzeTreatmentType(type, effectiveness) {
    const analysis = {
        type: type,
        effectiveness: effectiveness.overallScore,
        category: "",
        recommendations: []
    };
    
    switch (type) {
        case "fungicide":
            analysis.category = "Disease Control";
            if (effectiveness.overallScore < 60) {
                analysis.recommendations.push("Consider alternative fungicide");
                analysis.recommendations.push("Check application timing");
            }
            break;
        case "insecticide":
            analysis.category = "Pest Control";
            if (effectiveness.overallScore < 60) {
                analysis.recommendations.push("Verify pest identification");
                analysis.recommendations.push("Check application coverage");
            }
            break;
        case "fertilizer":
            analysis.category = "Nutrient Management";
            if (effectiveness.overallScore < 60) {
                analysis.recommendations.push("Test soil pH");
                analysis.recommendations.push("Consider slow-release fertilizer");
            }
            break;
        case "irrigation":
            analysis.category = "Water Management";
            if (effectiveness.overallScore < 60) {
                analysis.recommendations.push("Check irrigation system");
                analysis.recommendations.push("Monitor soil moisture");
            }
            break;
    }
    
    return analysis;
}

function _assessWeatherImpact(weather, treatmentType) {
    const impact = {
        positive: [],
        negative: [],
        neutral: [],
        overall: "neutral"
    };
    
    if (weather.avgTemperature > 25 && weather.avgTemperature < 30) {
        impact.positive.push("Optimal temperature for most treatments");
    } else if (weather.avgTemperature > 35) {
        impact.negative.push("High temperature may reduce treatment effectiveness");
    }
    
    if (weather.avgHumidity > 70 && treatmentType === "fungicide") {
        impact.negative.push("High humidity may reduce fungicide effectiveness");
    } else if (weather.avgHumidity < 40 && treatmentType === "irrigation") {
        impact.positive.push("Low humidity increases irrigation need");
    }
    
    if (weather.precipitationDays > 5) {
        impact.negative.push("Excessive rain may wash away treatments");
    } else if (weather.precipitationDays < 2 && treatmentType === "fertilizer") {
        impact.negative.push("Insufficient rain for fertilizer activation");
    }
    
    if (impact.positive.length > impact.negative.length) {
        impact.overall = "positive";
    } else if (impact.negative.length > impact.positive.length) {
        impact.overall = "negative";
    }
    
    return impact;
}

function _calculateCostEffectiveness(treatmentType, effectiveness) {
    const baseCosts = {
        "fungicide": 50,
        "insecticide": 40,
        "fertilizer": 80,
        "irrigation": 30,
        "pruning": 20,
        "harvesting": 15
    };
    
    const baseCost = baseCosts[treatmentType] || 50;
    const costEffectiveness = (effectiveness / 100) * (100 / baseCost);
    
    return {
        cost: baseCost,
        effectiveness: effectiveness,
        ratio: costEffectiveness,
        rating: costEffectiveness > 2 ? "Excellent" : 
                costEffectiveness > 1.5 ? "Good" : 
                costEffectiveness > 1 ? "Fair" : "Poor"
    };
}

function _assessEnvironmentalImpact(treatmentType, weather) {
    const impact = {
        score: 100,
        factors: [],
        rating: "Low"
    };
    
    switch (treatmentType) {
        case "fungicide":
            if (weather.precipitationDays > 5) {
                impact.score -= 20;
                impact.factors.push("High runoff risk");
            }
            break;
        case "insecticide":
            impact.score -= 15;
            impact.factors.push("Potential non-target effects");
            break;
        case "fertilizer":
            if (weather.precipitationDays > 3) {
                impact.score -= 25;
                impact.factors.push("Nutrient leaching risk");
            }
            break;
        case "irrigation":
            if (weather.avgTemperature > 30) {
                impact.score -= 10;
                impact.factors.push("High water consumption");
            }
            break;
    }
    
    if (impact.score > 80) impact.rating = "Low";
    else if (impact.score > 60) impact.rating = "Medium";
    else impact.rating = "High";
    
    return impact;
}

function _calculateBonusRewards(effectiveness, successMetrics) {
    let baseReward = 25; // Base treatment tracking reward
    let bonusMultiplier = 1.0;
    let bonusReasons = [];
    
    // Effectiveness bonus
    if (effectiveness.overallScore > 90) {
        bonusMultiplier += 0.5;
        bonusReasons.push("Excellent effectiveness");
    } else if (effectiveness.overallScore > 80) {
        bonusMultiplier += 0.3;
        bonusReasons.push("High effectiveness");
    } else if (effectiveness.overallScore > 70) {
        bonusMultiplier += 0.2;
        bonusReasons.push("Good effectiveness");
    }
    
    // Success metrics bonus
    if (successMetrics.diseaseReduction === "Significant") {
        bonusMultiplier += 0.3;
        bonusReasons.push("Significant disease reduction");
    }
    
    if (successMetrics.recoveryRate === "Excellent") {
        bonusMultiplier += 0.2;
        bonusReasons.push("Excellent recovery rate");
    }
    
    if (successMetrics.costEffectiveness.rating === "Excellent") {
        bonusMultiplier += 0.2;
        bonusReasons.push("Excellent cost effectiveness");
    }
    
    const totalReward = Math.floor(baseReward * bonusMultiplier);
    
    return {
        baseReward: baseReward,
        bonusMultiplier: bonusMultiplier,
        totalReward: totalReward,
        reasons: bonusReasons
    };
}

function _generateRecommendations(effectiveness, successMetrics, weather) {
    const recommendations = [];
    
    if (effectiveness.overallScore < 60) {
        recommendations.push("Consider alternative treatment approach");
        recommendations.push("Review application timing and method");
    }
    
    if (successMetrics.diseaseReduction === "Minimal") {
        recommendations.push("Increase treatment frequency");
        recommendations.push("Consult with agricultural expert");
    }
    
    if (weather.avgHumidity > 80) {
        recommendations.push("Monitor for fungal growth");
        recommendations.push("Consider preventive fungicide application");
    }
    
    if (weather.avgTemperature > 30) {
        recommendations.push("Increase irrigation frequency");
        recommendations.push("Monitor for heat stress");
    }
    
    if (recommendations.length === 0) {
        recommendations.push("Continue current treatment protocol");
        recommendations.push("Maintain regular monitoring schedule");
    }
    
    return recommendations;
}
`;

// Configuration for the function
const treatmentTrackingConfig = {
    source: treatmentTrackingSource,
    secrets: {
        API_KEY: "your_backend_api_key"
    },
    args: [
        "123",           // cropId
        "fungicide",     // treatmentType
        "85",            // treatmentProgress (percentage)
        "QmBeforeHash",  // beforeImageHash
        "QmAfterHash",   // afterImageHash
        "7",             // treatmentDuration (days)
        '{"avgTemperature":22,"avgHumidity":65,"precipitationDays":3,"sunlightHours":8}' // weatherData
    ],
    expectedReturnType: "string",
    gasLimit: 300000
};

module.exports = {
    source: treatmentTrackingSource,
    config: treatmentTrackingConfig
}; 