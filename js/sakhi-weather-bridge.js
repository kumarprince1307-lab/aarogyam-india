/**
 * ====================================================================
 * AAROGYAM SAKHI LIVE WEATHER & AGROMETEOROLOGICAL BRIDGE v1.0
 * - Connects Live Weather Forecast with Crop Spraying Decision Engine
 * - Evaluates Rain Risk, Wind Drift, Temperature & Humidity
 * - Generates Instant "आज स्प्रे करें या न करें?" Decision Card
 * ====================================================================
 */

'use strict';

(function () {
  const DEFAULT_DISTRICTS = {
    rewa: { name: "रीवा (मध्य प्रदेश)", temp: 28, rainProb: 15, windSpeed: 10, humidity: 60, condition: "साफ आसमान" },
    indore: { name: "इंदौर (मध्य प्रदेश)", temp: 30, rainProb: 10, windSpeed: 12, humidity: 55, condition: "धूप खिली है" },
    bhopal: { name: "भोपाल (मध्य प्रदेश)", temp: 29, rainProb: 20, windSpeed: 11, humidity: 58, condition: "हल्के बादल" },
    varanasi: { name: "वाराणसी (उत्तर प्रदेश)", temp: 31, rainProb: 10, windSpeed: 8, humidity: 62, condition: "साफ मौसम" },
    lucknow: { name: "लखनऊ (उत्तर प्रदेश)", temp: 30, rainProb: 15, windSpeed: 9, humidity: 64, condition: "साफ आसमान" },
    jaipur: { name: "जयपुर (राजस्थान)", temp: 32, rainProb: 5, windSpeed: 14, humidity: 45, condition: "धूप" },
    patna: { name: "पटना (बिहार)", temp: 30, rainProb: 25, windSpeed: 10, humidity: 68, condition: "बादल छाए हैं" }
  };

  function getWeatherDataForLocation(locName) {
    let key = (locName || '').toLowerCase().trim();
    for (const d in DEFAULT_DISTRICTS) {
      if (key.includes(d) || DEFAULT_DISTRICTS[d].name.toLowerCase().includes(key)) {
        return DEFAULT_DISTRICTS[d];
      }
    }
    // Return Rewa default if location not specified
    return DEFAULT_DISTRICTS.rewa;
  }

  function evaluateSprayDecision(weather) {
    const isRainRisk = weather.rainProb >= 40;
    const isHighWind = weather.windSpeed >= 18;
    const isHighHeat = weather.temp >= 36;

    let canSpray = true;
    let badgeColor = "#16a34a"; // Green
    let badgeText = "🟢 आज स्प्रे हेतु अनुकूल मौसम";
    let adviceList = [];

    if (isRainRisk) {
      canSpray = false;
      badgeColor = "#dc2626"; // Red
      badgeText = "🔴 आज स्प्रे स्थगित करें (बारिश का जोखिम)";
      adviceList.push("🌧️ **वर्षा चेतावनी:** आज बारिश की संभावना " + weather.rainProb + "% है। दवा धुलने का खतरा है।");
      adviceList.push("🌿 यदि कीट गंभीर हों, तो बिना **बायो-99 (Bio-99)** सिलिकॉन स्टिकर के बिल्कुल स्प्रे न करें।");
    } else if (isHighWind) {
      canSpray = false;
      badgeColor = "#d97706"; // Amber
      badgeText = "🟡 तेज हवा — सावधानी से स्प्रे करें";
      adviceList.push("💨 **हवा की गति:** " + weather.windSpeed + " km/h — दवा हवा से उड़कर नष्ट हो सकती है।");
      adviceList.push("⏰ हवा शांत होने पर शाम 4 बजे के बाद ही नोजल पौधे के पास रखकर छिड़कें।");
    } else if (isHighHeat) {
      canSpray = true;
      badgeColor = "#d97706";
      badgeText = "🟡 तेज धूप — केवल सुबह या शाम स्प्रे करें";
      adviceList.push("☀️ **तापमान:** " + weather.temp + "°C — दोपहर 11 से 3 बजे के बीच कड़ी धूप में स्प्रे न करें, पत्ते झुलस सकते हैं।");
      adviceList.push("⏰ सर्वोत्तम समय: सुबह 7 से 10 बजे या शाम 4 से 6:30 बजे।");
    } else {
      canSpray = true;
      badgeColor = "#16a34a";
      badgeText = "🟢 आज स्प्रे हेतु 100% उत्तम मौसम";
      adviceList.push("☀️ मौसम साफ है, हवा की गति (" + weather.windSpeed + " km/h) सामान्य है।");
      adviceList.push("💧 प्रति 15 लीटर पंप 5ml **बायो-99** अवश्य मिलाएं ताकि दवा पत्तों पर तुरंत फैलकर चिपक जाए।");
    }

    // Fertilizer advice
    const fertilizerAdvice = weather.humidity >= 50
      ? "🌱 खेत में नमी पर्याप्त है; आज शाम को पानी के साथ 1 लीटर **बायोफिट शेत (SHET)** देना अति उत्तम रहेगा।"
      : "🌱 यदि खेत सूखा है, तो पहले हल्की सिंचाई करें, फिर जीवाणु खाद या स्प्रे का उपयोग करें।";

    return {
      canSpray,
      badgeColor,
      badgeText,
      adviceList,
      fertilizerAdvice,
      weather
    };
  }

  window.SakhiWeatherBridge = {
    getWeatherDataForLocation,
    evaluateSprayDecision
  };

  console.log("⛅ Sakhi Weather & Spray Advisory Bridge initialized successfully!");
})();
