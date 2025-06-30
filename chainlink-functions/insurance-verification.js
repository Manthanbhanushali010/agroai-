/**
 * Insurance Verification Chainlink Function
 * Automated satellite-based claim processing for agricultural insurance
 */

const insuranceVerificationSource = `
// Insurance Verification Function for Automated Claim Processing
const claimId = args[0];
const farmerAddress = args[1];
const cropType = args[2];
const damageType = args[3];
const claimAmount = parseFloat(args[4]);
const location = args[5];
const latitude = parseFloat(args[6]);
const longitude = parseFloat(args[7]);
const incidentDate = parseInt(args[8]); // timestamp
const weatherData = args[9]; // JSON string of weather during incident

try {
    console.log("Starting insurance claim verification...");

    // 1. Parse Weather Data
    let weather = {};
    try {
        weather = JSON.parse(weatherData);
    } catch (e) {
        weather = {
            temperature: 25,
            humidity: 70,
            windSpeed: 10,
            precipitation: 0,
            pressure: 1013
        };
    }

    // 2. Satellite Data Analysis
    console.log("Analyzing satellite data...");
    const satelliteAnalysis = await _analyzeSatelliteData(latitude, longitude, incidentDate);

    // 3. Weather Event Verification
    console.log("Verifying weather events...");
    const weatherVerification = _verifyWeatherEvents(damageType, weather, incidentDate);

    // 4. Historical Data Comparison
    console.log("Comparing with historical data...");
    const historicalComparison = await _compareHistoricalData(location, cropType, damageType);

    // 5. Damage Assessment
    console.log("Assessing damage extent...");
    const damageAssessment = _assessDamageExtent(damageType, satelliteAnalysis, weatherVerification);

    // 6. Claim Validation
    console.log("Validating claim...");
    const claimValidation = _validateClaim(claimAmount, damageAssessment, historicalComparison);

    // 7. Fraud Detection
    console.log("Performing fraud detection...");
    const fraudAnalysis = _detectFraud(claimId, farmerAddress, damageType, weatherVerification);

    // 8. Settlement Calculation
    console.log("Calculating settlement...");
    const settlementCalculation = _calculateSettlement(claimValidation, damageAssessment, fraudAnalysis);

    // 9. Risk Assessment
    console.log("Assessing future risk...");
    const riskAssessment = _assessFutureRisk(location, cropType, weatherVerification);

    // 10. Compile Insurance Report
    const insuranceReport = {
        // Claim Information
        claim: {
            id: claimId,
            farmer: farmerAddress,
            cropType: cropType,
            damageType: damageType,
            requestedAmount: claimAmount,
            status: settlementCalculation.approved ? "Approved" : "Rejected"
        },

        // Location Information
        location: {
            coordinates: {
                latitude: latitude,
                longitude: longitude
            },
            area: location,
            satelliteCoverage: satelliteAnalysis.coverage
        },

        // Satellite Analysis
        satellite: satelliteAnalysis,

        // Weather Verification
        weather: {
            conditions: weather,
            verification: weatherVerification,
            correlation: _correlateWeatherDamage(damageType, weather)
        },

        // Damage Assessment
        damage: damageAssessment,

        // Claim Validation
        validation: claimValidation,

        // Fraud Analysis
        fraud: fraudAnalysis,

        // Settlement
        settlement: settlementCalculation,

        // Risk Assessment
        risk: riskAssessment,

        // Recommendations
        recommendations: _generateInsuranceRecommendations(settlementCalculation, riskAssessment),

        // Metadata
        metadata: {
            timestamp: Date.now(),
            incidentDate: incidentDate,
            processingTime: Date.now() - incidentDate,
            dataSources: ["Satellite Imagery", "Weather APIs", "Historical Records", "Blockchain Data"]
        }
    };

    console.log("Insurance verification completed. Settlement:", settlementCalculation.approved ? "Approved" : "Rejected");
    return Functions.encodeString(JSON.stringify(insuranceReport));

} catch (error) {
    console.error("Insurance verification error:", error.message);
    
    const errorReport = {
        error: true,
        message: error.message,
        timestamp: Date.now(),
        claimId: claimId,
        farmer: farmerAddress
    };
    
    return Functions.encodeString(JSON.stringify(errorReport));
}

// Helper Functions
async function _analyzeSatelliteData(lat, lon, incidentDate) {
    // Simulate satellite data analysis
    const timeSinceIncident = Date.now() - incidentDate;
    const daysSinceIncident = Math.floor(timeSinceIncident / (1000 * 60 * 60 * 24));
    
    // Simulate NDVI (Normalized Difference Vegetation Index) analysis
    const beforeNDVI = 0.7 + (Math.random() * 0.2); // 0.7-0.9 (healthy)
    const afterNDVI = 0.3 + (Math.random() * 0.3); // 0.3-0.6 (damaged)
    
    const vegetationLoss = ((beforeNDVI - afterNDVI) / beforeNDVI) * 100;
    
    return {
        coverage: "Full",
        resolution: "10m",
        beforeNDVI: beforeNDVI,
        afterNDVI: afterNDVI,
        vegetationLoss: Math.round(vegetationLoss),
        damageVisible: vegetationLoss > 20,
        cloudCover: Math.random() * 30, // 0-30%
        imageQuality: "High",
        analysisConfidence: 85 + (Math.random() * 15) // 85-100%
    };
}

function _verifyWeatherEvents(damageType, weather, incidentDate) {
    const verification = {
        eventType: "",
        severity: "Low",
        correlation: 0,
        verified: false,
        factors: []
    };
    
    switch (damageType.toLowerCase()) {
        case "drought":
            if (weather.precipitation < 1 && weather.temperature > 30) {
                verification.eventType = "Drought";
                verification.severity = "High";
                verification.correlation = 90;
                verification.verified = true;
                verification.factors.push("Low precipitation", "High temperature");
            }
            break;
        case "flood":
            if (weather.precipitation > 50) {
                verification.eventType = "Flood";
                verification.severity = weather.precipitation > 100 ? "High" : "Medium";
                verification.correlation = 85;
                verification.verified = true;
                verification.factors.push("High precipitation");
            }
            break;
        case "hail":
            if (weather.pressure < 1000 && weather.windSpeed > 20) {
                verification.eventType = "Hail";
                verification.severity = "Medium";
                verification.correlation = 75;
                verification.verified = true;
                verification.factors.push("Low pressure", "High wind speed");
            }
            break;
        case "frost":
            if (weather.temperature < 0) {
                verification.eventType = "Frost";
                verification.severity = weather.temperature < -5 ? "High" : "Medium";
                verification.correlation = 95;
                verification.verified = true;
                verification.factors.push("Freezing temperature");
            }
            break;
        case "disease":
            if (weather.humidity > 80 && weather.temperature > 20) {
                verification.eventType = "Disease Outbreak";
                verification.severity = "Medium";
                verification.correlation = 70;
                verification.verified = true;
                verification.factors.push("High humidity", "Warm temperature");
            }
            break;
    }
    
    return verification;
}

async function _compareHistoricalData(location, cropType, damageType) {
    // Simulate historical data comparison
    const historicalIncidents = Math.floor(Math.random() * 10) + 1; // 1-10 incidents
    const averageLoss = 50000 + (Math.random() * 100000); // $50k-$150k average
    const frequency = historicalIncidents > 5 ? "High" : historicalIncidents > 2 ? "Medium" : "Low";
    
    return {
        historicalIncidents: historicalIncidents,
        averageLoss: Math.round(averageLoss),
        frequency: frequency,
        trend: Math.random() > 0.5 ? "Increasing" : "Decreasing",
        riskLevel: frequency === "High" ? "High" : frequency === "Medium" ? "Medium" : "Low"
    };
}

function _assessDamageExtent(damageType, satelliteAnalysis, weatherVerification) {
    let damagePercentage = 0;
    let confidence = 0;
    
    // Base damage from satellite analysis
    if (satelliteAnalysis.damageVisible) {
        damagePercentage = satelliteAnalysis.vegetationLoss;
        confidence = satelliteAnalysis.analysisConfidence;
    }
    
    // Adjust based on weather verification
    if (weatherVerification.verified) {
        confidence += 10;
        if (weatherVerification.severity === "High") {
            damagePercentage = Math.min(100, damagePercentage * 1.2);
        }
    } else {
        confidence -= 20;
    }
    
    // Damage type adjustments
    switch (damageType.toLowerCase()) {
        case "drought":
            damagePercentage = Math.min(100, damagePercentage * 1.1);
            break;
        case "flood":
            damagePercentage = Math.min(100, damagePercentage * 1.3);
            break;
        case "hail":
            damagePercentage = Math.min(100, damagePercentage * 0.9);
            break;
        case "frost":
            damagePercentage = Math.min(100, damagePercentage * 1.2);
            break;
    }
    
    return {
        percentage: Math.round(damagePercentage),
        confidence: Math.min(100, confidence),
        severity: damagePercentage > 80 ? "Severe" : 
                 damagePercentage > 50 ? "Moderate" : 
                 damagePercentage > 20 ? "Light" : "Minimal",
        verified: weatherVerification.verified && satelliteAnalysis.damageVisible
    };
}

function _validateClaim(claimAmount, damageAssessment, historicalComparison) {
    const validation = {
        reasonable: false,
        overvalued: false,
        undervalued: false,
        recommendedAmount: 0,
        confidence: 0
    };
    
    // Calculate recommended amount based on damage percentage
    const baseValue = 100000; // Base crop value
    validation.recommendedAmount = (damageAssessment.percentage / 100) * baseValue;
    
    // Compare with claimed amount
    const difference = Math.abs(claimAmount - validation.recommendedAmount);
    const percentageDifference = (difference / validation.recommendedAmount) * 100;
    
    if (percentageDifference < 20) {
        validation.reasonable = true;
        validation.confidence = 90;
    } else if (claimAmount > validation.recommendedAmount * 1.5) {
        validation.overvalued = true;
        validation.confidence = 80;
    } else if (claimAmount < validation.recommendedAmount * 0.5) {
        validation.undervalued = true;
        validation.confidence = 85;
    }
    
    // Adjust based on historical data
    if (historicalComparison.riskLevel === "High") {
        validation.recommendedAmount *= 1.1; // 10% increase for high-risk areas
    }
    
    return validation;
}

function _detectFraud(claimId, farmerAddress, damageType, weatherVerification) {
    const fraudIndicators = [];
    let fraudScore = 0;
    
    // Check for weather event verification
    if (!weatherVerification.verified) {
        fraudIndicators.push("Weather event not verified");
        fraudScore += 30;
    }
    
    // Check for suspicious timing (simplified)
    const currentTime = Date.now();
    const suspiciousTiming = currentTime % 2 === 0; // Simulate suspicious timing
    if (suspiciousTiming) {
        fraudIndicators.push("Suspicious claim timing");
        fraudScore += 20;
    }
    
    // Check for repeated claims (simplified)
    const repeatedClaims = Math.random() > 0.8; // 20% chance of repeated claims
    if (repeatedClaims) {
        fraudIndicators.push("Multiple claims from same farmer");
        fraudScore += 25;
    }
    
    // Check for impossible damage combinations
    if (damageType.toLowerCase() === "drought" && weatherVerification.eventType === "Flood") {
        fraudIndicators.push("Impossible damage-weather combination");
        fraudScore += 50;
    }
    
    const fraudRisk = fraudScore > 70 ? "High" : 
                     fraudScore > 40 ? "Medium" : "Low";
    
    return {
        score: fraudScore,
        risk: fraudRisk,
        indicators: fraudIndicators,
        flagged: fraudScore > 50
    };
}

function _calculateSettlement(validation, damageAssessment, fraudAnalysis) {
    const settlement = {
        approved: false,
        amount: 0,
        reason: "",
        conditions: []
    };
    
    // Check fraud risk
    if (fraudAnalysis.flagged) {
        settlement.reason = "High fraud risk detected";
        return settlement;
    }
    
    // Check damage verification
    if (!damageAssessment.verified) {
        settlement.reason = "Damage not verified by satellite and weather data";
        return settlement;
    }
    
    // Check claim reasonableness
    if (!validation.reasonable) {
        if (validation.overvalued) {
            settlement.approved = true;
            settlement.amount = validation.recommendedAmount;
            settlement.reason = "Claim approved at recommended amount (original overvalued)";
        } else {
            settlement.reason = "Claim amount significantly undervalued";
        }
    } else {
        settlement.approved = true;
        settlement.amount = validation.recommendedAmount;
        settlement.reason = "Claim approved at recommended amount";
    }
    
    // Add conditions for high-risk claims
    if (fraudAnalysis.score > 20) {
        settlement.conditions.push("Additional verification required");
    }
    
    if (damageAssessment.confidence < 80) {
        settlement.conditions.push("Manual review recommended");
    }
    
    return settlement;
}

function _assessFutureRisk(location, cropType, weatherVerification) {
    const riskFactors = [];
    let riskScore = 0;
    
    // Weather pattern risk
    if (weatherVerification.eventType === "Drought") {
        riskFactors.push("Drought-prone area");
        riskScore += 30;
    }
    
    if (weatherVerification.eventType === "Flood") {
        riskFactors.push("Flood-prone area");
        riskScore += 25;
    }
    
    // Crop-specific risk
    switch (cropType.toLowerCase()) {
        case "corn":
            riskFactors.push("Susceptible to drought");
            riskScore += 15;
            break;
        case "rice":
            riskFactors.push("Requires consistent water");
            riskScore += 20;
            break;
        case "wheat":
            riskFactors.push("Sensitive to frost");
            riskScore += 10;
            break;
    }
    
    const riskLevel = riskScore > 50 ? "High" : 
                     riskScore > 30 ? "Medium" : "Low";
    
    return {
        score: riskScore,
        level: riskLevel,
        factors: riskFactors,
        recommendations: _generateRiskRecommendations(riskLevel, cropType)
    };
}

function _correlateWeatherDamage(damageType, weather) {
    const correlation = {
        strong: [],
        moderate: [],
        weak: [],
        overall: "weak"
    };
    
    switch (damageType.toLowerCase()) {
        case "drought":
            if (weather.precipitation < 1) correlation.strong.push("No precipitation");
            if (weather.temperature > 30) correlation.strong.push("High temperature");
            break;
        case "flood":
            if (weather.precipitation > 50) correlation.strong.push("Heavy precipitation");
            break;
        case "frost":
            if (weather.temperature < 0) correlation.strong.push("Freezing temperature");
            break;
    }
    
    if (correlation.strong.length > 0) correlation.overall = "strong";
    else if (correlation.moderate.length > 0) correlation.overall = "moderate";
    
    return correlation;
}

function _generateInsuranceRecommendations(settlement, riskAssessment) {
    const recommendations = [];
    
    if (settlement.approved) {
        recommendations.push("Process payment within 48 hours");
        recommendations.push("Schedule follow-up inspection");
    } else {
        recommendations.push("Request additional documentation");
        recommendations.push("Schedule manual review");
    }
    
    if (riskAssessment.level === "High") {
        recommendations.push("Increase monitoring frequency");
        recommendations.push("Consider premium adjustment");
    }
    
    return recommendations;
}

function _generateRiskRecommendations(riskLevel, cropType) {
    const recommendations = [];
    
    if (riskLevel === "High") {
        recommendations.push("Implement preventive measures");
        recommendations.push("Consider crop insurance");
        recommendations.push("Diversify crop selection");
    } else if (riskLevel === "Medium") {
        recommendations.push("Monitor weather forecasts");
        recommendations.push("Prepare contingency plans");
    } else {
        recommendations.push("Continue current practices");
        recommendations.push("Regular risk assessment");
    }
    
    return recommendations;
}
`;

// Configuration for the function
const insuranceVerificationConfig = {
    source: insuranceVerificationSource,
    secrets: {
        API_KEY: "your_backend_api_key"
    },
    args: [
        "CLAIM_001",     // claimId
        "0x1234...",     // farmerAddress
        "corn",          // cropType
        "drought",       // damageType
        "75000",         // claimAmount
        "Iowa, USA",     // location
        "41.8781",       // latitude
        "-93.0977",      // longitude
        "1640995200000", // incidentDate (timestamp)
        '{"temperature":35,"humidity":30,"windSpeed":15,"precipitation":0,"pressure":1020}' // weatherData
    ],
    expectedReturnType: "string",
    gasLimit: 300000
};

module.exports = {
    source: insuranceVerificationSource,
    config: insuranceVerificationConfig
}; 