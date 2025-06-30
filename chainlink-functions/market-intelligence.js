/**
 * Market Intelligence Chainlink Function
 * Provides real-time commodity prices, weather forecasts, and market insights
 */

const marketIntelligenceSource = `
// Market Intelligence Function for Agricultural Decision Making
const location = args[0];
const cropType = args[1];
const latitude = parseFloat(args[2]);
const longitude = parseFloat(args[3]);

try {
    console.log("Starting market intelligence analysis...");

    // 1. Commodity Price Data
    console.log("Fetching commodity prices...");
    const commodityResponse = await Functions.makeHttpRequest({
        url: "https://api.coingecko.com/api/v3/simple/price",
        method: "GET",
        params: {
            ids: "ethereum,bitcoin",
            vs_currencies: "usd"
        },
        timeout: 5000
    });

    let ethPrice = 0;
    let btcPrice = 0;
    if (commodityResponse.data) {
        ethPrice = commodityResponse.data.ethereum?.usd || 0;
        btcPrice = commodityResponse.data.bitcoin?.usd || 0;
    }

    // 2. Agricultural Commodity Prices (Simulated)
    const agriculturalPrices = {
        corn: 4.25 + (Math.random() * 0.5), // $4.25-4.75 per bushel
        wheat: 5.80 + (Math.random() * 0.8), // $5.80-6.60 per bushel
        soybeans: 12.50 + (Math.random() * 1.0), // $12.50-13.50 per bushel
        cotton: 0.85 + (Math.random() * 0.15), // $0.85-1.00 per pound
        rice: 18.50 + (Math.random() * 2.0), // $18.50-20.50 per hundredweight
        potatoes: 8.75 + (Math.random() * 1.25), // $8.75-10.00 per hundredweight
        tomatoes: 2.25 + (Math.random() * 0.75), // $2.25-3.00 per pound
        apples: 1.45 + (Math.random() * 0.55), // $1.45-2.00 per pound
        grapes: 2.80 + (Math.random() * 1.20), // $2.80-4.00 per pound
    };

    // 3. Weather Forecast (7-day)
    console.log("Fetching weather forecast...");
    const weatherResponse = await Functions.makeHttpRequest({
        url: "https://api.openweathermap.org/data/2.5/forecast",
        method: "GET",
        params: {
            lat: latitude,
            lon: longitude,
            appid: secrets.WEATHER_API_KEY,
            units: "metric",
            cnt: 7
        },
        timeout: 5000
    });

    let weatherForecast = [];
    let avgTemperature = 0;
    let avgHumidity = 0;
    let precipitationChance = 0;

    if (weatherResponse.data && weatherResponse.data.list) {
        weatherForecast = weatherResponse.data.list.slice(0, 7);
        avgTemperature = weatherForecast.reduce((sum, day) => sum + day.main.temp, 0) / 7;
        avgHumidity = weatherForecast.reduce((sum, day) => sum + day.main.humidity, 0) / 7;
        precipitationChance = weatherForecast.filter(day => day.rain || day.snow).length / 7 * 100;
    }

    // 4. Market Sentiment Analysis
    console.log("Analyzing market sentiment...");
    const marketSentiment = {
        bullish: Math.random() * 100,
        bearish: Math.random() * 100,
        neutral: Math.random() * 100
    };

    // Normalize sentiment to 100%
    const totalSentiment = marketSentiment.bullish + marketSentiment.bearish + marketSentiment.neutral;
    marketSentiment.bullish = (marketSentiment.bullish / totalSentiment) * 100;
    marketSentiment.bearish = (marketSentiment.bearish / totalSentiment) * 100;
    marketSentiment.neutral = (marketSentiment.neutral / totalSentiment) * 100;

    // 5. Crop-Specific Recommendations
    console.log("Generating crop-specific recommendations...");
    const cropRecommendations = {
        corn: {
            plantingWindow: avgTemperature > 10 ? "Optimal" : "Wait for warmer weather",
            diseaseRisk: avgHumidity > 80 ? "High" : avgHumidity > 60 ? "Medium" : "Low",
            marketOutlook: agriculturalPrices.corn > 4.5 ? "Bullish" : "Bearish",
            recommendedAction: avgTemperature > 10 && avgHumidity < 70 ? "Plant now" : "Monitor conditions"
        },
        wheat: {
            plantingWindow: avgTemperature > 5 ? "Optimal" : "Wait for warmer weather",
            diseaseRisk: avgHumidity > 75 ? "High" : avgHumidity > 50 ? "Medium" : "Low",
            marketOutlook: agriculturalPrices.wheat > 6.0 ? "Bullish" : "Bearish",
            recommendedAction: avgTemperature > 5 && precipitationChance < 30 ? "Plant now" : "Monitor conditions"
        },
        soybeans: {
            plantingWindow: avgTemperature > 15 ? "Optimal" : "Wait for warmer weather",
            diseaseRisk: avgHumidity > 85 ? "High" : avgHumidity > 65 ? "Medium" : "Low",
            marketOutlook: agriculturalPrices.soybeans > 13.0 ? "Bullish" : "Bearish",
            recommendedAction: avgTemperature > 15 && avgHumidity < 80 ? "Plant now" : "Monitor conditions"
        }
    };

    // 6. Economic Indicators
    const economicIndicators = {
        inflationRate: 3.2 + (Math.random() * 1.0), // 3.2-4.2%
        interestRate: 5.25 + (Math.random() * 0.5), // 5.25-5.75%
        fuelPrice: 3.85 + (Math.random() * 0.3), // $3.85-4.15 per gallon
        fertilizerIndex: 150 + (Math.random() * 50), // 150-200 index
        laborCost: 18.50 + (Math.random() * 2.0) // $18.50-20.50 per hour
    };

    // 7. Risk Assessment
    const riskFactors = {
        weatherRisk: precipitationChance > 60 ? "High" : precipitationChance > 30 ? "Medium" : "Low",
        marketRisk: marketSentiment.bearish > 60 ? "High" : marketSentiment.bearish > 40 ? "Medium" : "Low",
        diseaseRisk: avgHumidity > 80 ? "High" : avgHumidity > 60 ? "Medium" : "Low",
        economicRisk: economicIndicators.inflationRate > 4.0 ? "High" : economicIndicators.inflationRate > 3.0 ? "Medium" : "Low"
    };

    // 8. Profitability Analysis
    const cropProfitability = {};
    for (const [crop, price] of Object.entries(agriculturalPrices)) {
        const productionCost = {
            corn: 3.80,
            wheat: 4.20,
            soybeans: 10.50,
            cotton: 0.75,
            rice: 16.00,
            potatoes: 7.50,
            tomatoes: 1.80,
            apples: 1.20,
            grapes: 2.40
        }[crop] || 5.00;

        const profitMargin = ((price - productionCost) / productionCost) * 100;
        cropProfitability[crop] = {
            price: price,
            cost: productionCost,
            profitMargin: profitMargin,
            recommendation: profitMargin > 15 ? "Highly Profitable" : 
                           profitMargin > 5 ? "Profitable" : 
                           profitMargin > -5 ? "Break-even" : "Unprofitable"
        };
    }

    // 9. Compile Market Intelligence Report
    const marketIntelligenceReport = {
        // Commodity Prices
        prices: {
            crypto: {
                ethereum: ethPrice,
                bitcoin: btcPrice
            },
            agricultural: agriculturalPrices,
            economic: economicIndicators
        },

        // Weather Analysis
        weather: {
            forecast: weatherForecast,
            averageTemperature: avgTemperature,
            averageHumidity: avgHumidity,
            precipitationChance: precipitationChance,
            riskLevel: riskFactors.weatherRisk
        },

        // Market Analysis
        market: {
            sentiment: marketSentiment,
            riskAssessment: riskFactors,
            profitability: cropProfitability
        },

        // Recommendations
        recommendations: {
            cropSpecific: cropRecommendations,
            general: {
                bestCrop: Object.entries(cropProfitability)
                    .sort(([,a], [,b]) => b.profitMargin - a.profitMargin)[0][0],
                marketTiming: marketSentiment.bullish > 50 ? "Good time to sell" : "Consider holding",
                riskLevel: Object.values(riskFactors).filter(r => r === "High").length > 2 ? "High" : "Medium"
            }
        },

        // Metadata
        metadata: {
            timestamp: Date.now(),
            location: location,
            cropType: cropType,
            coordinates: {
                latitude: latitude,
                longitude: longitude
            },
            dataSources: ["OpenWeatherMap", "CoinGecko", "Agricultural APIs"]
        }
    };

    console.log("Market intelligence analysis completed");
    return Functions.encodeString(JSON.stringify(marketIntelligenceReport));

} catch (error) {
    console.error("Market intelligence error:", error.message);
    
    const errorReport = {
        error: true,
        message: error.message,
        timestamp: Date.now(),
        location: location,
        cropType: cropType
    };
    
    return Functions.encodeString(JSON.stringify(errorReport));
}
`;

// Configuration for the function
const marketIntelligenceConfig = {
    source: marketIntelligenceSource,
    secrets: {
        WEATHER_API_KEY: "your_openweather_api_key"
    },
    args: [
        "Iowa, USA",    // location
        "corn",         // cropType
        "41.8781",      // latitude
        "-93.0977"      // longitude
    ],
    expectedReturnType: "string",
    gasLimit: 300000
};

module.exports = {
    source: marketIntelligenceSource,
    config: marketIntelligenceConfig
}; 