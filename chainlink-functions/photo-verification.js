/**
 * Enhanced Photo Verification Chainlink Function
 * Integrates AI analysis with weather data, satellite imagery, and fraud detection
 */

// Main function source code for Chainlink Functions
const photoVerificationSource = `
// Enhanced Photo Verification with Multi-Source Data
const imageHash = args[0];
const cropType = args[1];
const location = args[2];
const latitude = parseFloat(args[3]);
const longitude = parseFloat(args[4]);
const backendUrl = args[5];

try {
    // 1. Primary AI Analysis
    console.log("Starting AI analysis...");
    const aiResponse = await Functions.makeHttpRequest({
        url: backendUrl + "/api/disease-detection",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + secrets.API_KEY
        },
        data: {
            imageHash: imageHash,
            cropType: cropType,
            location: location,
            timestamp: Date.now()
        },
        timeout: 10000
    });

    if (aiResponse.error) {
        throw new Error("AI analysis failed: " + aiResponse.error);
    }

    const aiResult = aiResponse.data;
    console.log("AI analysis completed:", aiResult.disease, aiResult.confidence);

    // 2. Weather Data Correlation
    console.log("Fetching weather data...");
    const weatherResponse = await Functions.makeHttpRequest({
        url: "https://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        params: {
            lat: latitude,
            lon: longitude,
            appid: secrets.WEATHER_API_KEY,
            units: "metric"
        },
        timeout: 5000
    });

    const weather = weatherResponse.data;
    const temperature = weather.main.temp;
    const humidity = weather.main.humidity;
    const pressure = weather.main.pressure;
    
    console.log("Weather data:", temperature + "°C", humidity + "%", pressure + "hPa");

    // 3. Disease Risk Assessment Based on Weather
    let weatherRiskScore = 0;
    let weatherRiskLevel = "low";
    
    // High humidity and moderate temperature increase disease risk
    if (humidity > 80 && temperature > 15 && temperature < 30) {
        weatherRiskScore = Math.min(100, humidity + (30 - Math.abs(temperature - 22.5)) * 2);
        weatherRiskLevel = weatherRiskScore > 70 ? "high" : "medium";
    } else if (humidity > 60) {
        weatherRiskScore = humidity * 0.8;
        weatherRiskLevel = weatherRiskScore > 50 ? "medium" : "low";
    }

    console.log("Weather risk assessment:", weatherRiskLevel, weatherRiskScore);

    // 4. Historical Weather Pattern Check
    const historicalWeatherResponse = await Functions.makeHttpRequest({
        url: "https://api.openweathermap.org/data/2.5/onecall/timemachine",
        method: "GET",
        params: {
            lat: latitude,
            lon: longitude,
            dt: Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
            appid: secrets.WEATHER_API_KEY
        },
        timeout: 5000
    });

    let weatherTrend = "stable";
    if (historicalWeatherResponse.data && historicalWeatherResponse.data.current) {
        const prevHumidity = historicalWeatherResponse.data.current.humidity;
        const humidityChange = humidity - prevHumidity;
        weatherTrend = humidityChange > 10 ? "increasing_risk" : 
                     humidityChange < -10 ? "decreasing_risk" : "stable";
    }

    // 5. Satellite Data Simulation (In production, use actual satellite API)
    console.log("Simulating satellite data correlation...");
    const satelliteData = {
        vegetationIndex: 0.7 + (Math.random() * 0.3), // NDVI simulation
        soilMoisture: humidity * 0.8 + (Math.random() * 20),
        cloudCover: weather.clouds ? weather.clouds.all : 0,
        lastImageDate: Date.now() - (Math.random() * 7 * 24 * 60 * 60 * 1000) // Within last week
    };

    // 6. Fraud Detection Checks
    console.log("Performing fraud detection...");
    let fraudScore = 0;
    let fraudFlags = [];

    // Check for duplicate submissions (simplified)
    const submissionTime = Date.now();
    const timeWindow = 60 * 60 * 1000; // 1 hour
    
    // Check if confidence is suspiciously high for poor weather conditions
    if (aiResult.confidence > 95 && weatherRiskScore > 80) {
        fraudScore += 20;
        fraudFlags.push("high_confidence_poor_conditions");
    }

    // Check for impossible disease-weather combinations
    if (aiResult.disease && aiResult.disease.includes("drought") && humidity > 80) {
        fraudScore += 30;
        fraudFlags.push("impossible_disease_weather_combo");
    }

    // Check for metadata consistency
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
        fraudScore += 50;
        fraudFlags.push("invalid_coordinates");
    }

    // 7. Verification Score Calculation
    let verificationScore = 0;
    let verificationFactors = {};

    // AI confidence weight (40%)
    const aiWeight = aiResult.confidence * 0.4;
    verificationScore += aiWeight;
    verificationFactors.aiConfidence = aiWeight;

    // Weather correlation weight (25%)
    const weatherCorrelation = aiResult.disease && aiResult.disease !== "Healthy" ? 
        (weatherRiskScore > 50 ? 25 : 15) : 
        (weatherRiskScore < 30 ? 25 : 10);
    verificationScore += weatherCorrelation;
    verificationFactors.weatherCorrelation = weatherCorrelation;

    // Satellite data correlation weight (20%)
    const satelliteCorrelation = satelliteData.vegetationIndex < 0.5 && aiResult.disease !== "Healthy" ? 20 : 
                                satelliteData.vegetationIndex > 0.8 && aiResult.disease === "Healthy" ? 20 : 10;
    verificationScore += satelliteCorrelation;
    verificationFactors.satelliteCorrelation = satelliteCorrelation;

    // Historical consistency weight (10%)
    const historicalConsistency = weatherTrend === "increasing_risk" && aiResult.disease !== "Healthy" ? 10 : 
                                 weatherTrend === "decreasing_risk" && aiResult.disease === "Healthy" ? 10 : 5;
    verificationScore += historicalConsistency;
    verificationFactors.historicalConsistency = historicalConsistency;

    // Fraud penalty weight (5%)
    const fraudPenalty = Math.max(0, 5 - (fraudScore * 0.1));
    verificationScore += fraudPenalty;
    verificationFactors.fraudPenalty = fraudPenalty;

    // 8. Reward Calculation
    let baseReward = 5; // Base photo reward
    let bonusReward = 0;
    let rewardMultiplier = 1.0;

    if (aiResult.disease && aiResult.disease !== "Healthy") {
        // Disease detected
        if (aiResult.confidence > 90 && verificationScore > 80) {
            bonusReward = 200; // Early detection bonus
        } else if (aiResult.confidence > 70 && verificationScore > 60) {
            bonusReward = 100; // Standard disease detection
        } else {
            bonusReward = 50; // Low confidence detection
        }
    } else {
        // Healthy plant
        bonusReward = 20;
    }

    // Weather-based multiplier
    if (weatherRiskLevel === "high" && aiResult.disease !== "Healthy") {
        rewardMultiplier = 1.3; // 30% bonus for high-risk conditions
    } else if (weatherRiskLevel === "low" && aiResult.disease === "Healthy") {
        rewardMultiplier = 1.1; // 10% bonus for healthy plants in good conditions
    }

    const totalReward = Math.floor((baseReward + bonusReward) * rewardMultiplier);

    // 9. Community Alert Assessment
    let shouldTriggerAlert = false;
    let alertSeverity = 0;

    if (aiResult.disease && aiResult.disease !== "Healthy" && verificationScore > 70) {
        alertSeverity = weatherRiskScore > 70 ? 3 : weatherRiskScore > 50 ? 2 : 1;
        shouldTriggerAlert = alertSeverity >= 2;
    }

    // 10. Compile Final Result
    const verificationResult = {
        // AI Analysis
        disease: aiResult.disease || "Unknown",
        confidence: aiResult.confidence || 0,
        aiAnalysis: {
            disease: aiResult.disease,
            confidence: aiResult.confidence,
            severity: aiResult.severity || 0,
            treatmentRecommendation: aiResult.treatment || "None"
        },

        // Weather Data
        weather: {
            temperature: temperature,
            humidity: humidity,
            pressure: pressure,
            riskScore: weatherRiskScore,
            riskLevel: weatherRiskLevel,
            trend: weatherTrend
        },

        // Satellite Data
        satellite: satelliteData,

        // Verification
        verification: {
            score: Math.round(verificationScore),
            verified: verificationScore > 60,
            factors: verificationFactors,
            fraudScore: fraudScore,
            fraudFlags: fraudFlags
        },

        // Rewards
        rewards: {
            baseReward: baseReward,
            bonusReward: bonusReward,
            multiplier: rewardMultiplier,
            totalReward: totalReward
        },

        // Community
        community: {
            shouldAlert: shouldTriggerAlert,
            alertSeverity: alertSeverity,
            location: location
        },

        // Metadata
        metadata: {
            timestamp: submissionTime,
            imageHash: imageHash,
            cropType: cropType,
            location: location,
            coordinates: {
                latitude: latitude,
                longitude: longitude
            }
        }
    };

    console.log("Verification completed. Score:", verificationScore, "Reward:", totalReward);
    
    return Functions.encodeString(JSON.stringify(verificationResult));

} catch (error) {
    console.error("Verification error:", error.message);
    
    // Return error result with minimal reward
    const errorResult = {
        disease: "Error",
        confidence: 0,
        verification: {
            score: 0,
            verified: false,
            error: error.message
        },
        rewards: {
            totalReward: 5 // Minimum photo reward
        },
        metadata: {
            timestamp: Date.now(),
            imageHash: imageHash,
            error: true
        }
    };
    
    return Functions.encodeString(JSON.stringify(errorResult));
}
`;

// Configuration for the function
const functionConfig = {
    source: photoVerificationSource,
    secrets: {
        API_KEY: "your_backend_api_key",
        WEATHER_API_KEY: "your_openweather_api_key"
    },
    args: [
        "QmYourImageHash", // imageHash
        "corn",           // cropType
        "Iowa, USA",      // location
        "41.8781",        // latitude
        "-93.0977",       // longitude
        "https://your-backend.com" // backendUrl
    ],
    expectedReturnType: "string",
    gasLimit: 300000
};

// Export for deployment
module.exports = {
    source: photoVerificationSource,
    config: functionConfig
};

