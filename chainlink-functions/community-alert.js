/**
 * Community Alert Chainlink Function
 * Detects disease outbreaks and triggers viral notifications to nearby farmers
 */

const communityAlertSource = `
// Community Alert Function for Disease Outbreak Detection
const diseaseType = args[0];
const severity = parseInt(args[1]);
const location = args[2];
const latitude = parseFloat(args[3]);
const longitude = parseFloat(args[4]);
const radius = parseInt(args[5]); // km
const affectedCrops = args[6]; // JSON string of affected crops
const weatherConditions = args[7]; // JSON string of weather data

try {
    console.log("Starting community alert analysis...");

    // 1. Parse Input Data
    let crops = [];
    let weather = {};
    
    try {
        crops = JSON.parse(affectedCrops);
        weather = JSON.parse(weatherConditions);
    } catch (e) {
        crops = [diseaseType];
        weather = {
            temperature: 25,
            humidity: 70,
            windSpeed: 10,
            precipitation: 0
        };
    }

    // 2. Disease Risk Assessment
    console.log("Assessing disease risk...");
    const diseaseRisk = _assessDiseaseRisk(diseaseType, severity, weather);

    // 3. Geographic Spread Analysis
    console.log("Analyzing geographic spread...");
    const spreadAnalysis = _analyzeGeographicSpread(latitude, longitude, radius, weather);

    // 4. Weather Correlation
    console.log("Correlating weather conditions...");
    const weatherCorrelation = _correlateWeatherConditions(diseaseType, weather);

    // 5. Historical Outbreak Data
    console.log("Checking historical outbreak data...");
    const historicalData = await _getHistoricalOutbreakData(diseaseType, location);

    // 6. Affected Population Calculation
    console.log("Calculating affected population...");
    const populationImpact = _calculatePopulationImpact(latitude, longitude, radius, crops);

    // 7. Economic Impact Assessment
    console.log("Assessing economic impact...");
    const economicImpact = _assessEconomicImpact(diseaseType, severity, populationImpact);

    // 8. Alert Priority Calculation
    console.log("Calculating alert priority...");
    const alertPriority = _calculateAlertPriority(diseaseRisk, spreadAnalysis, economicImpact);

    // 9. Notification Strategy
    console.log("Determining notification strategy...");
    const notificationStrategy = _determineNotificationStrategy(alertPriority, populationImpact);

    // 10. Prevention Recommendations
    console.log("Generating prevention recommendations...");
    const preventionRecommendations = _generatePreventionRecommendations(diseaseType, weather, severity);

    // 11. Compile Community Alert Report
    const communityAlertReport = {
        // Alert Information
        alert: {
            type: "disease_outbreak",
            priority: alertPriority.level,
            severity: severity,
            status: "active",
            timestamp: Date.now()
        },

        // Disease Information
        disease: {
            type: diseaseType,
            risk: diseaseRisk,
            affectedCrops: crops,
            symptoms: _getDiseaseSymptoms(diseaseType),
            transmission: _getTransmissionMethod(diseaseType)
        },

        // Geographic Information
        location: {
            coordinates: {
                latitude: latitude,
                longitude: longitude
            },
            radius: radius,
            area: Math.PI * radius * radius, // km²
            spread: spreadAnalysis
        },

        // Weather Analysis
        weather: {
            conditions: weather,
            correlation: weatherCorrelation,
            riskFactors: _identifyWeatherRiskFactors(weather, diseaseType)
        },

        // Impact Assessment
        impact: {
            population: populationImpact,
            economic: economicImpact,
            historical: historicalData
        },

        // Notification Strategy
        notifications: notificationStrategy,

        // Prevention
        prevention: preventionRecommendations,

        // Response Actions
        response: {
            immediate: _getImmediateActions(alertPriority.level),
            shortTerm: _getShortTermActions(diseaseType, severity),
            longTerm: _getLongTermActions(diseaseType, location)
        },

        // Metadata
        metadata: {
            location: location,
            timestamp: Date.now(),
            dataSources: ["Weather APIs", "Agricultural Databases", "Historical Records"]
        }
    };

    console.log("Community alert analysis completed. Priority:", alertPriority.level);
    return Functions.encodeString(JSON.stringify(communityAlertReport));

} catch (error) {
    console.error("Community alert error:", error.message);
    
    const errorReport = {
        error: true,
        message: error.message,
        timestamp: Date.now(),
        diseaseType: diseaseType,
        location: location
    };
    
    return Functions.encodeString(JSON.stringify(errorReport));
}

// Helper Functions
function _assessDiseaseRisk(diseaseType, severity, weather) {
    let riskScore = severity * 10; // Base risk from severity
    
    // Weather-based risk factors
    if (weather.humidity > 80) riskScore += 20;
    if (weather.temperature > 25 && weather.temperature < 35) riskScore += 15;
    if (weather.precipitation > 0) riskScore += 10;
    
    // Disease-specific risk factors
    switch (diseaseType.toLowerCase()) {
        case "late_blight":
            if (weather.humidity > 85) riskScore += 25;
            if (weather.temperature > 20) riskScore += 20;
            break;
        case "powdery_mildew":
            if (weather.humidity > 70) riskScore += 20;
            if (weather.temperature > 25) riskScore += 15;
            break;
        case "rust":
            if (weather.humidity > 75) riskScore += 20;
            if (weather.windSpeed > 15) riskScore += 15;
            break;
        case "bacterial_blight":
            if (weather.humidity > 80) riskScore += 25;
            if (weather.temperature > 30) riskScore += 20;
            break;
    }
    
    const riskLevel = riskScore > 80 ? "Critical" : 
                     riskScore > 60 ? "High" : 
                     riskScore > 40 ? "Medium" : "Low";
    
    return {
        score: Math.min(100, riskScore),
        level: riskLevel,
        factors: _getRiskFactors(diseaseType, weather)
    };
}

function _analyzeGeographicSpread(lat, lon, radius, weather) {
    const spreadFactors = {
        windSpread: weather.windSpeed > 20 ? "High" : weather.windSpeed > 10 ? "Medium" : "Low",
        waterSpread: weather.precipitation > 5 ? "High" : weather.precipitation > 1 ? "Medium" : "Low",
        humanSpread: "Medium", // Based on farming practices
        animalSpread: "Low" // Based on local wildlife
    };
    
    const effectiveRadius = radius * (1 + (weather.windSpeed / 50)); // Wind increases spread
    
    return {
        factors: spreadFactors,
        effectiveRadius: Math.round(effectiveRadius),
        spreadDirection: _calculateWindDirection(weather),
        containmentDifficulty: _assessContainmentDifficulty(spreadFactors)
    };
}

function _correlateWeatherConditions(diseaseType, weather) {
    const correlation = {
        favorable: [],
        unfavorable: [],
        neutral: [],
        overall: "neutral"
    };
    
    switch (diseaseType.toLowerCase()) {
        case "late_blight":
            if (weather.humidity > 85) correlation.favorable.push("High humidity ideal for spore germination");
            if (weather.temperature > 20) correlation.favorable.push("Warm temperatures accelerate growth");
            if (weather.precipitation > 0) correlation.favorable.push("Moisture promotes disease spread");
            break;
        case "powdery_mildew":
            if (weather.humidity > 70) correlation.favorable.push("Moderate humidity supports fungal growth");
            if (weather.temperature > 25) correlation.favorable.push("Warm temperatures favor development");
            break;
        case "rust":
            if (weather.humidity > 75) correlation.favorable.push("High humidity required for spore production");
            if (weather.windSpeed > 15) correlation.favorable.push("Wind aids spore dispersal");
            break;
    }
    
    if (weather.temperature < 10) correlation.unfavorable.push("Cold temperatures inhibit disease development");
    if (weather.humidity < 50) correlation.unfavorable.push("Low humidity limits fungal growth");
    
    if (correlation.favorable.length > correlation.unfavorable.length) {
        correlation.overall = "favorable";
    } else if (correlation.unfavorable.length > correlation.favorable.length) {
        correlation.overall = "unfavorable";
    }
    
    return correlation;
}

async function _getHistoricalOutbreakData(diseaseType, location) {
    // Simulate historical data retrieval
    const historicalOutbreaks = {
        frequency: Math.floor(Math.random() * 5) + 1, // 1-5 outbreaks per year
        lastOutbreak: Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000), // Random date in last year
        averageSeverity: Math.floor(Math.random() * 40) + 30, // 30-70 severity
        economicLoss: Math.floor(Math.random() * 1000000) + 50000 // $50k-$1M loss
    };
    
    return {
        outbreaks: historicalOutbreaks,
        trend: historicalOutbreaks.frequency > 3 ? "Increasing" : "Stable",
        riskPeriod: _identifyRiskPeriod(diseaseType)
    };
}

function _calculatePopulationImpact(lat, lon, radius, crops) {
    // Simulate population calculation based on agricultural density
    const agriculturalDensity = 0.15; // 15% of area is agricultural
    const farmerDensity = 0.02; // 2% of population are farmers
    const area = Math.PI * radius * radius;
    
    const totalArea = area; // km²
    const agriculturalArea = totalArea * agriculturalDensity;
    const estimatedFarmers = Math.floor(agriculturalArea * farmerDensity * 100); // 100 farmers per km²
    
    return {
        totalArea: Math.round(totalArea),
        agriculturalArea: Math.round(agriculturalArea),
        estimatedFarmers: estimatedFarmers,
        affectedCrops: crops.length,
        cropDiversity: crops.length > 3 ? "High" : crops.length > 1 ? "Medium" : "Low"
    };
}

function _assessEconomicImpact(diseaseType, severity, populationImpact) {
    const baseLossPerFarmer = 5000; // $5k base loss per farmer
    const severityMultiplier = severity / 100;
    const cropMultiplier = populationImpact.affectedCrops * 0.2;
    
    const totalLoss = populationImpact.estimatedFarmers * baseLossPerFarmer * severityMultiplier * (1 + cropMultiplier);
    
    return {
        estimatedLoss: Math.round(totalLoss),
        lossPerFarmer: Math.round(baseLossPerFarmer * severityMultiplier),
        insuranceImpact: totalLoss > 100000 ? "High" : totalLoss > 50000 ? "Medium" : "Low",
        marketImpact: severity > 70 ? "Significant" : severity > 40 ? "Moderate" : "Minimal"
    };
}

function _calculateAlertPriority(diseaseRisk, spreadAnalysis, economicImpact) {
    let priorityScore = 0;
    
    // Disease risk weight (40%)
    priorityScore += diseaseRisk.score * 0.4;
    
    // Spread potential weight (30%)
    const spreadScore = spreadAnalysis.effectiveRadius > 20 ? 100 : 
                       spreadAnalysis.effectiveRadius > 10 ? 70 : 40;
    priorityScore += spreadScore * 0.3;
    
    // Economic impact weight (30%)
    const economicScore = economicImpact.estimatedLoss > 500000 ? 100 :
                         economicImpact.estimatedLoss > 100000 ? 70 : 40;
    priorityScore += economicScore * 0.3;
    
    const priorityLevel = priorityScore > 80 ? "Critical" :
                         priorityScore > 60 ? "High" :
                         priorityScore > 40 ? "Medium" : "Low";
    
    return {
        score: Math.round(priorityScore),
        level: priorityLevel,
        factors: {
            diseaseRisk: diseaseRisk.score,
            spreadPotential: spreadScore,
            economicImpact: economicScore
        }
    };
}

function _determineNotificationStrategy(alertPriority, populationImpact) {
    const strategy = {
        immediate: [],
        delayed: [],
        channels: [],
        frequency: "low"
    };
    
    if (alertPriority.level === "Critical") {
        strategy.immediate.push("Emergency SMS alerts");
        strategy.immediate.push("Push notifications");
        strategy.channels = ["SMS", "Push", "Email", "Radio", "Social Media"];
        strategy.frequency = "high";
    } else if (alertPriority.level === "High") {
        strategy.immediate.push("Push notifications");
        strategy.delayed.push("Email alerts");
        strategy.channels = ["Push", "Email", "Social Media"];
        strategy.frequency = "medium";
    } else {
        strategy.delayed.push("Email alerts");
        strategy.channels = ["Email", "Social Media"];
        strategy.frequency = "low";
    }
    
    return strategy;
}

function _generatePreventionRecommendations(diseaseType, weather, severity) {
    const recommendations = [];
    
    // General recommendations
    if (weather.humidity > 80) {
        recommendations.push("Increase ventilation in greenhouses");
        recommendations.push("Apply preventive fungicides");
    }
    
    if (weather.temperature > 25) {
        recommendations.push("Monitor for early symptoms");
        recommendations.push("Implement crop rotation");
    }
    
    // Disease-specific recommendations
    switch (diseaseType.toLowerCase()) {
        case "late_blight":
            recommendations.push("Remove infected plant debris");
            recommendations.push("Apply copper-based fungicides");
            recommendations.push("Avoid overhead irrigation");
            break;
        case "powdery_mildew":
            recommendations.push("Improve air circulation");
            recommendations.push("Apply sulfur-based treatments");
            recommendations.push("Remove infected leaves");
            break;
        case "rust":
            recommendations.push("Apply fungicides at first sign");
            recommendations.push("Remove alternate hosts");
            recommendations.push("Use resistant varieties");
            break;
    }
    
    return recommendations;
}

function _getRiskFactors(diseaseType, weather) {
    const factors = [];
    
    if (weather.humidity > 80) factors.push("High humidity");
    if (weather.temperature > 25) factors.push("Warm temperatures");
    if (weather.precipitation > 0) factors.push("Moisture present");
    if (weather.windSpeed > 15) factors.push("High wind speed");
    
    return factors;
}

function _calculateWindDirection(weather) {
    // Simulate wind direction calculation
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return directions[Math.floor(Math.random() * directions.length)];
}

function _assessContainmentDifficulty(spreadFactors) {
    let difficulty = 0;
    
    if (spreadFactors.windSpread === "High") difficulty += 30;
    if (spreadFactors.waterSpread === "High") difficulty += 25;
    if (spreadFactors.humanSpread === "High") difficulty += 20;
    if (spreadFactors.animalSpread === "High") difficulty += 15;
    
    return difficulty > 60 ? "Very Difficult" :
           difficulty > 40 ? "Difficult" :
           difficulty > 20 ? "Moderate" : "Easy";
}

function _identifyRiskPeriod(diseaseType) {
    const riskPeriods = {
        "late_blight": "Late summer to early fall",
        "powdery_mildew": "Spring to summer",
        "rust": "Spring and fall",
        "bacterial_blight": "Warm, wet periods"
    };
    
    return riskPeriods[diseaseType.toLowerCase()] || "Variable";
}

function _getDiseaseSymptoms(diseaseType) {
    const symptoms = {
        "late_blight": ["Dark lesions on leaves", "White fungal growth", "Rapid plant death"],
        "powdery_mildew": ["White powdery spots", "Leaf curling", "Stunted growth"],
        "rust": ["Orange/brown pustules", "Leaf spots", "Premature defoliation"],
        "bacterial_blight": ["Water-soaked lesions", "Wilting", "Bacterial ooze"]
    };
    
    return symptoms[diseaseType.toLowerCase()] || ["Unknown symptoms"];
}

function _getTransmissionMethod(diseaseType) {
    const transmission = {
        "late_blight": "Wind, water, infected plant debris",
        "powdery_mildew": "Wind, direct contact",
        "rust": "Wind, insects, contaminated tools",
        "bacterial_blight": "Water, insects, contaminated equipment"
    };
    
    return transmission[diseaseType.toLowerCase()] || "Unknown";
}

function _identifyWeatherRiskFactors(weather, diseaseType) {
    const factors = [];
    
    if (weather.humidity > 80) factors.push("High humidity promotes fungal growth");
    if (weather.temperature > 25) factors.push("Warm temperatures accelerate disease development");
    if (weather.precipitation > 0) factors.push("Moisture facilitates disease spread");
    if (weather.windSpeed > 15) factors.push("Wind aids spore dispersal");
    
    return factors;
}

function _getImmediateActions(priorityLevel) {
    const actions = {
        "Critical": [
            "Issue emergency alert to all farmers in radius",
            "Deploy rapid response team",
            "Implement quarantine measures",
            "Contact agricultural authorities"
        ],
        "High": [
            "Send priority notifications",
            "Increase monitoring frequency",
            "Prepare response resources"
        ],
        "Medium": [
            "Send standard alerts",
            "Monitor situation closely"
        ],
        "Low": [
            "Send informational alerts",
            "Continue routine monitoring"
        ]
    };
    
    return actions[priorityLevel] || actions["Low"];
}

function _getShortTermActions(diseaseType, severity) {
    return [
        "Distribute treatment recommendations",
        "Organize farmer education sessions",
        "Coordinate with local agricultural experts",
        "Monitor treatment effectiveness"
    ];
}

function _getLongTermActions(diseaseType, location) {
    return [
        "Develop disease-resistant crop varieties",
        "Implement integrated pest management",
        "Improve early detection systems",
        "Establish regional monitoring networks"
    ];
}
`;

// Configuration for the function
const communityAlertConfig = {
    source: communityAlertSource,
    secrets: {
        API_KEY: "your_backend_api_key"
    },
    args: [
        "late_blight",   // diseaseType
        "75",            // severity (1-100)
        "Iowa, USA",     // location
        "41.8781",       // latitude
        "-93.0977",      // longitude
        "15",            // radius (km)
        '["potato","tomato"]', // affectedCrops
        '{"temperature":25,"humidity":85,"windSpeed":15,"precipitation":5}' // weatherConditions
    ],
    expectedReturnType: "string",
    gasLimit: 300000
};

module.exports = {
    source: communityAlertSource,
    config: communityAlertConfig
}; 