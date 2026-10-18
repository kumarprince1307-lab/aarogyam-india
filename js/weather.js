// Aarogyam India - Advanced 7-Day Visual Weather & Agrometeorological Advisory Engine (V26 Pro)
// Uses Free Open-Meteo API with 1-Hour Zero-Egress LocalStorage Caching & Smart Agro-Decision Meter

(function() {
  'use strict';

  const DISTRICT_COORDINATES = {
    'rewa': { name: 'रीवा (Rewa)', state: 'मध्य प्रदेश', lat: 24.5362, lon: 81.3038 },
    'indore': { name: 'इंदौर (Indore)', state: 'मध्य प्रदेश', lat: 22.7196, lon: 75.8577 },
    'bhopal': { name: 'भोपाल (Bhopal)', state: 'मध्य प्रदेश', lat: 23.2599, lon: 77.4126 },
    'ujjain': { name: 'उज्जैन (Ujjain)', state: 'मध्य प्रदेश', lat: 23.1765, lon: 75.7885 },
    'jabalpur': { name: 'जबलपुर (Jabalpur)', state: 'मध्य प्रदेश', lat: 23.1815, lon: 79.9864 },
    'satna': { name: 'सतना (Satna)', state: 'मध्य प्रदेश', lat: 24.5804, lon: 80.8293 },
    'varanasi': { name: 'वाराणसी (Varanasi)', state: 'उत्तर प्रदेश', lat: 25.3176, lon: 82.9739 },
    'lucknow': { name: 'लखनऊ (Lucknow)', state: 'उत्तर प्रदेश', lat: 26.8467, lon: 80.9462 },
    'sitapur': { name: 'सीतापुर (Sitapur)', state: 'उत्तर प्रदेश', lat: 27.5667, lon: 80.6833 },
    'kanpur': { name: 'कानपुर (Kanpur)', state: 'उत्तर प्रदेश', lat: 26.4499, lon: 80.3319 },
    'jaipur': { name: 'जयपुर (Jaipur)', state: 'राजस्थान', lat: 26.9124, lon: 75.7873 },
    'kota': { name: 'कोटा (Kota)', state: 'राजस्थान', lat: 25.2138, lon: 75.8648 },
    'patna': { name: 'पटना (Patna)', state: 'बिहार', lat: 25.5941, lon: 85.1376 },
    'nagpur': { name: 'नागपुर (Nagpur)', state: 'महाराष्ट्र', lat: 21.1458, lon: 79.0882 },
    'karnal': { name: 'करनाल (Karnal)', state: 'हरियाणा', lat: 29.6857, lon: 76.9905 },
    'ludhiana': { name: 'लुधियाना (Ludhiana)', state: 'पंजाब', lat: 30.9010, lon: 75.8573 }
  };

  const WMO_WEATHER_CODES = {
    0: { desc: 'साफ आसमान (Clear Sky)', icon: '☀️', condition: 'clear' },
    1: { desc: 'मुख्यतः साफ (Mainly Clear)', icon: '🌤️', condition: 'partly_cloudy' },
    2: { desc: 'हल्के बादल (Partly Cloudy)', icon: '⛅', condition: 'partly_cloudy' },
    3: { desc: 'घने बादल (Overcast)', icon: '☁️', condition: 'cloudy' },
    45: { desc: 'कोहरा (Foggy)', icon: '🌫️', condition: 'fog' },
    48: { desc: 'घना कोहरा (Dense Fog)', icon: '🌫️', condition: 'fog' },
    51: { desc: 'हल्की बूंदाबांदी (Light Drizzle)', icon: '🌦️', condition: 'rain' },
    53: { desc: 'मध्यम बूंदाबांदी (Moderate Drizzle)', icon: '🌦️', condition: 'rain' },
    55: { desc: 'तेज बूंदाबांदी (Dense Drizzle)', icon: '🌧️', condition: 'rain' },
    61: { desc: 'हल्की बारिश (Slight Rain)', icon: '🌧️', condition: 'rain' },
    63: { desc: 'मध्यम बारिश (Moderate Rain)', icon: '🌧️', condition: 'rain' },
    65: { desc: 'भारी बारिश (Heavy Rain)', icon: '⛈️', condition: 'heavy_rain' },
    71: { desc: 'हल्की बर्फबारी (Slight Snow)', icon: '🌨️', condition: 'snow' },
    80: { desc: 'बारिश के छींटे (Rain Showers)', icon: '🌦️', condition: 'rain' },
    81: { desc: 'मध्यम बारिश बौछार (Moderate Showers)', icon: '🌧️', condition: 'rain' },
    82: { desc: 'तेज आंधी-बारिश (Violent Showers)', icon: '⛈️', condition: 'storm' },
    95: { desc: 'गरज-चमक के साथ बारिश (Thunderstorm)', icon: '⚡⛈️', condition: 'storm' },
    96: { desc: 'गरज के साथ ओलावृष्टि (Thunderstorm with Hail)', icon: '⛈️❄️', condition: 'hail' },
    99: { desc: 'भीषण आंधी-ओलावृष्टि (Heavy Thunderstorm with Hail)', icon: '🚨⛈️', condition: 'hail' }
  };

  const DAYS_HINDI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

  const STORAGE_SAVED_LOC_KEY = 'AAROGYAM_USER_WEATHER_LOCATION';

  function sanitizeText(str, maxLen = 60) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[<>'"]/g, '').trim().slice(0, maxLen);
  }

  function saveUserWeatherPreference(locObj) {
    if (!locObj) return;
    try {
      const lat = parseFloat(locObj.lat);
      const lon = parseFloat(locObj.lon);
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return; // Security safeguard against invalid coordinates
      }
      const safeCity = sanitizeText(locObj.cityName || 'स्थानीय क्षेत्र');
      const safeState = sanitizeText(locObj.stateName || 'भारत');
      const safeKey = sanitizeText(locObj.key || 'gps', 20);

      localStorage.setItem(STORAGE_SAVED_LOC_KEY, JSON.stringify({
        key: safeKey,
        lat: lat,
        lon: lon,
        cityName: safeCity,
        stateName: safeState,
        source: locObj.source || 'manual',
        savedAt: Date.now()
      }));
    } catch(e) {}
  }

  function getSavedUserWeatherPreference() {
    try {
      const s = localStorage.getItem(STORAGE_SAVED_LOC_KEY);
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number' && parsed.cityName) {
          if (parsed.lat >= -90 && parsed.lat <= 90 && parsed.lon >= -180 && parsed.lon <= 180) {
            return {
              key: sanitizeText(parsed.key || 'saved', 20),
              lat: parsed.lat,
              lon: parsed.lon,
              cityName: sanitizeText(parsed.cityName),
              stateName: sanitizeText(parsed.stateName || 'भारत'),
              source: parsed.source || 'manual'
            };
          }
        }
      }
    } catch(e) {}
    return null;
  }

  window.AIM_CURRENT_WEATHER_STATE = null;

  window.load7DayWeather = async function(locationKey, userLat = null, userLon = null, customCityName = '', customStateName = '', skipSave = false) {
    let lat, lon, displayName, displayState;

    if (userLat && userLon) {
      lat = parseFloat(userLat);
      lon = parseFloat(userLon);
      displayName = sanitizeText(customCityName || 'मेरी लाइव लोकेशन');
      displayState = sanitizeText(customStateName || 'GPS ऑटो-डिटेक्ट');
    } else {
      const loc = DISTRICT_COORDINATES[locationKey.toLowerCase()] || DISTRICT_COORDINATES['rewa'];
      lat = loc.lat;
      lon = loc.lon;
      displayName = loc.name;
      displayState = loc.state;
    }

    if (!skipSave) {
      saveUserWeatherPreference({
        key: locationKey,
        lat,
        lon,
        cityName: displayName,
        stateName: displayState,
        source: (userLat && userLon) ? 'gps' : 'manual'
      });
    }

    // Immediately pre-update header hero elements
    const cEl = document.getElementById('displayCityName');
    const sEl = document.getElementById('displayCountry');
    if (cEl) cEl.textContent = displayName;
    if (sEl) sEl.textContent = displayState;

    const cacheKey = `AIM_WEATHER_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const now = Date.now();

    // 1. Check 1-Hour Zero-Egress LocalStorage Cache
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (now - cached.timestamp < 3600000) { // 1 hour TTL
          renderWeatherDashboard(cached.data, displayName, displayState);
          return;
        }
      }
    } catch(e) {}

    // 2. Fetch Free Open-Meteo 7-Day Forecast
    try {
      const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();

      // Save to cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ timestamp: now, data }));
      } catch(e) {}

      renderWeatherDashboard(data, displayName, displayState);
    } catch(err) {
      console.warn('[Weather Engine] Fallback error:', err);
    }
  };

  function renderWeatherDashboard(data, cityName, stateName) {
    const current = data.current || {};
    const daily = data.daily || {};

    const temp = Math.round(current.temperature_2m ?? 28);
    const feelsLike = Math.round(current.apparent_temperature ?? temp);
    const humidity = Math.round(current.relative_humidity_2m ?? 65);
    const windSpeed = Math.round(current.wind_speed_10m ?? 10);
    const wCode = current.weather_code ?? 0;
    const wInfo = WMO_WEATHER_CODES[wCode] || { desc: 'साफ आसमान', icon: '☀️', condition: 'clear' };
    const todayRainProb = Math.round((daily.precipitation_probability_max && daily.precipitation_probability_max[0]) ?? 0);

    // Save global state for WhatsApp sharing
    window.AIM_CURRENT_WEATHER_STATE = {
      cityName,
      stateName,
      temp,
      feelsLike,
      humidity,
      windSpeed,
      condition: wInfo.desc,
      rainProb: todayRainProb
    };

    // 1. Update Hero Card
    const cityEl = document.getElementById('displayCityName');
    const stateEl = document.getElementById('displayCountry');
    const tempEl = document.getElementById('displayTemp');
    const condEl = document.getElementById('displayCondition');
    const iconEl = document.getElementById('weatherIconDisplay');
    const feelsEl = document.getElementById('displayFeelsLike');
    const humidityEl = document.getElementById('displayHumidity');
    const windEl = document.getElementById('displayWind');

    if (cityEl) cityEl.textContent = cityName;
    if (stateEl) stateEl.textContent = stateName;
    if (tempEl) tempEl.textContent = `${temp}°C`;
    if (condEl) condEl.textContent = wInfo.desc;
    if (iconEl) iconEl.innerHTML = getAnimatedWeatherVisual(wInfo.condition, wInfo.icon);
    if (feelsEl) feelsEl.textContent = `${feelsLike}°C`;
    if (humidityEl) humidityEl.textContent = `${humidity}%`;
    if (windEl) windEl.textContent = `${windSpeed} km/h`;

    // 2. Update Mandi Page KPI card if present
    const mandiWeatherWrap = document.getElementById('mandi-kpi-weather-data');
    if (mandiWeatherWrap) {
      mandiWeatherWrap.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:1.6rem; font-weight:900; color:#fde047;">${temp}°C</span>
          <span style="font-size:0.86rem; color:#cbd5e1; font-weight:700;">📍 ${cityName} (${wInfo.desc})</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; margin-top:4px; font-size:0.76rem;">
          <span style="background:${todayRainProb > 40 || windSpeed > 20 ? '#991b1b' : '#15803d'}; color:${todayRainProb > 40 || windSpeed > 20 ? '#fecaca' : '#86efac'}; padding:2px 8px; border-radius:12px; font-weight:800;">
            ${todayRainProb > 40 || windSpeed > 20 ? '🛑 स्प्रे स्थगित रखें' : '🚜 स्प्रे: उत्तम समय'}
          </span>
          <span style="color:#94a3b8;">🌧️ वर्षा: ${todayRainProb}% | 💧 नमी: ${humidity}%</span>
        </div>
      `;
    }

    // 3. Render Dynamic Agro KPI Grid
    renderAgroKpiDashboard(temp, humidity, windSpeed, todayRainProb);

    // 3. Render 7-Day Forecast Grid
    const forecastGrid = document.getElementById('weather-7day-grid');
    if (forecastGrid && daily.time && Array.isArray(daily.time)) {
      forecastGrid.innerHTML = daily.time.map((dateStr, idx) => {
        const d = new Date(dateStr);
        const dayName = idx === 0 ? 'आज' : (idx === 1 ? 'कल' : DAYS_HINDI[d.getDay()]);
        const maxTemp = Math.round(daily.temperature_2m_max[idx] ?? 30);
        const minTemp = Math.round(daily.temperature_2m_min[idx] ?? 20);
        const rainProb = Math.round(daily.precipitation_probability_max[idx] ?? 0);
        const code = daily.weather_code[idx] ?? 0;
        const info = WMO_WEATHER_CODES[code] || { desc: 'साफ', icon: '☀️' };

        return `
          <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid ${idx === 0 ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; border-radius: 14px; padding: 14px 10px; text-align: center; color: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.25); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
            <div style="font-size: 0.86rem; font-weight: 800; color: ${idx === 0 ? '#fde047' : '#94a3b8'}; margin-bottom: 4px;">
              ${dayName}
            </div>
            <div style="font-size: 0.72rem; color: #64748b; margin-bottom: 8px;">
              ${d.getDate()} ${['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिसं'][d.getMonth()]}
            </div>
            <div style="font-size: 2.2rem; margin: 4px 0;">
              ${info.icon}
            </div>
            <div style="font-size: 0.78rem; color: #e2e8f0; font-weight: 700; min-height: 32px; display: flex; align-items: center; justify-content: center;">
              ${info.desc}
            </div>
            <div style="display: flex; justify-content: center; gap: 8px; font-size: 0.88rem; font-weight: 800; margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.12);">
              <span style="color: #f87171;">${maxTemp}°</span>
              <span style="color: #60a5fa;">${minTemp}°</span>
            </div>
            ${rainProb > 20 ? `
              <div style="margin-top: 6px; font-size: 0.72rem; color: #38bdf8; font-weight: 800; background: rgba(56,189,248,0.15); padding: 3px 6px; border-radius: 6px;">
                🌧️ ${rainProb}% बारिश
              </div>
            ` : `
              <div style="margin-top: 6px; font-size: 0.72rem; color: #a7f3d0; font-weight: 700;">
                ☀️ 0% बारिश
              </div>
            `}
          </div>
        `;
      }).join('');
    }

    // 4. Render Agrometeorological Advisory Box
    renderAgroAdvisory(current, daily);
  }

  // Smart Agro Decision KPI Engine
  function renderAgroKpiDashboard(temp, humidity, windSpeed, rainProb) {
    const kpiWrap = document.getElementById('weather-dynamic-kpi-grid');
    if (!kpiWrap) return;

    // Evaluate Spray Decision
    let spraySafe = true;
    let sprayReasons = [];
    if (rainProb >= 35) {
      spraySafe = false;
      sprayReasons.push(`बारिश की ${rainProb}% संभावना (दवा बहने का खतरा)`);
    }
    if (windSpeed >= 18) {
      spraySafe = false;
      sprayReasons.push(`हवा की तेज गति ${windSpeed} km/h (ड्रिफ्ट का खतरा)`);
    }
    if (temp >= 35) {
      sprayReasons.push(`तेज धूप (${temp}°C) में वाष्पीकरण का खतरा`);
    }

    const sprayBadge = spraySafe ? `
      <div style="background: linear-gradient(135deg, #14532d 0%, #166534 100%); border: 1.5px solid #4ade80; border-radius: 14px; padding: 16px; color: #fff; box-shadow: 0 4px 16px rgba(22, 163, 74, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.76rem; font-weight: 800; color: #86efac; text-transform: uppercase;">🚜 कृषि स्प्रे निर्णय</span>
          <span style="background: #22c55e; color: #052e16; font-size: 0.68rem; font-weight: 900; padding: 2px 8px; border-radius: 10px;">🟢 अनुशंसित</span>
        </div>
        <div style="font-size: 1.25rem; font-weight: 900; color: #f0fdf4; margin-bottom: 4px;">आज स्प्रे के लिए उत्तम</div>
        <div style="font-size: 0.82rem; color: #bbf7d0; line-height: 1.45;">
          हवा शांत (${windSpeed} km/h) व वर्षा संभावना न्यून (${rainProb}%) है। सुबह 7-10:30 या शाम 4-6:30 बजे स्प्रे करें।
        </div>
      </div>
    ` : `
      <div style="background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); border: 1.5px solid #f87171; border-radius: 14px; padding: 16px; color: #fff; box-shadow: 0 4px 16px rgba(220, 38, 38, 0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.76rem; font-weight: 800; color: #fca5a5; text-transform: uppercase;">🚜 कृषि स्प्रे निर्णय</span>
          <span style="background: #ef4444; color: #ffffff; font-size: 0.68rem; font-weight: 900; padding: 2px 8px; border-radius: 10px;">🔴 रोकें / टालें</span>
        </div>
        <div style="font-size: 1.25rem; font-weight: 900; color: #fef2f2; margin-bottom: 4px;">आज स्प्रे स्थगित रखें</div>
        <div style="font-size: 0.82rem; color: #fecaca; line-height: 1.45;">
          कारण: ${sprayReasons.join(', ')}। दवा का छिड़काव रुकने पर ही करें।
        </div>
      </div>
    `;

    // Humidity / Fungus Risk Badge
    const fungusRisk = humidity >= 75 ? 'उच्च जोखिम (High Risk)' : (humidity >= 60 ? 'मध्यम (Moderate)' : 'न्यूनतम (Low)');
    const fungusColor = humidity >= 75 ? '#f87171' : (humidity >= 60 ? '#fde047' : '#4ade80');

    // Fertilizer Advisory
    const fertSafe = rainProb < 40;
    const fertStatus = fertSafe ? '🟢 सुरक्षित (नमी अनुसार दें)' : '🔴 स्थगित (बहने का खतरा)';

    kpiWrap.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px;">
        ${sprayBadge}

        <!-- KPI Card 2: Rain Probability & Radar -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1.5px solid #334155; border-radius: 14px; padding: 16px; color: #fff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.76rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">🌧️ वर्षा संभावना मीटर</span>
            <span style="color: ${rainProb > 40 ? '#f87171' : '#38bdf8'}; font-weight: 900; font-size: 0.95rem;">${rainProb}%</span>
          </div>
          <div style="width: 100%; height: 8px; background: #334155; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${rainProb}%; height: 100%; background: linear-gradient(90deg, #38bdf8, #2563eb); border-radius: 4px;"></div>
          </div>
          <div style="font-size: 0.82rem; color: #cbd5e1;">
            ${rainProb >= 40 ? '⚠️ आगामी 24 घंटों में बारिश की संभावना। जल निकासी की व्यवस्था रखें।' : '☀️ मौसम शुष्क रहेगा, सामान्य सिंचाई जारी रख सकते हैं।'}
          </div>
        </div>

        <!-- KPI Card 3: Moisture & Fungus Disease Alert -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1.5px solid #334155; border-radius: 14px; padding: 16px; color: #fff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.76rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">🦠 फफूंद व रोग अलर्ट</span>
            <span style="color: ${fungusColor}; font-weight: 900; font-size: 0.82rem;">${fungusRisk}</span>
          </div>
          <div style="font-size: 1.25rem; font-weight: 900; color: #f8fafc; margin-bottom: 4px;">हवा में नमी: ${humidity}%</div>
          <div style="font-size: 0.82rem; color: #cbd5e1;">
            ${humidity >= 75 ? 'धान, मिर्च व सब्जियों में झुलसा/ब्लाइट की निगरानी करें। जैविक फंगीसाइड रैपअप तैयार रखें।' : 'रोग की संभावना सामान्य है। नियमित जैविक पोषण जारी रखें।'}
          </div>
        </div>

        <!-- KPI Card 4: Fertilizer Timing -->
        <div style="background: rgba(15, 23, 42, 0.9); border: 1.5px solid #334155; border-radius: 14px; padding: 16px; color: #fff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.76rem; font-weight: 800; color: #94a3b8; text-transform: uppercase;">🧪 खाद व उर्वरक अनुप्रयोग</span>
            <span style="font-size: 0.74rem; font-weight: 900; color: #fbbf24;">${fertStatus}</span>
          </div>
          <div style="font-size: 1.25rem; font-weight: 900; color: #f8fafc; margin-bottom: 4px;">शेत (SHET) व जीवाणु खाद</div>
          <div style="font-size: 0.82rem; color: #cbd5e1;">
            ${fertSafe ? 'जमीन में उचित नमी होने पर शेत बैक्टीरिया अथवा डीएपी/यूरिया देने का अनुकूल समय।' : 'बारिश होने से खाद बह सकती है, वर्षा रुकने के बाद ही खाद दें।'}
          </div>
        </div>
      </div>
    `;
  }

  function renderAgroAdvisory(current, daily) {
    const advisoryWrap = document.getElementById('weather-agro-advisory-wrap');
    if (!advisoryWrap) return;

    const rainDays = daily.precipitation_probability_max ? daily.precipitation_probability_max.slice(0, 3).filter(p => p >= 40).length : 0;
    const maxTemp = current.temperature_2m || 30;
    const humidity = current.relative_humidity_2m || 60;

    let tips = [];

    if (rainDays > 0) {
      tips.push({
        icon: '🌧️',
        title: 'बारिश अलर्ट — स्प्रे व यूरिया तुरंत रोकें:',
        desc: 'आगामी 48 घंटों में बारिश की संभावना है। कीटनाशक, खरपतवारनाशी एवं यूरिया का छिड़काव न करें, दवा बह सकती है। जल निकासी की व्यवस्था रखें।'
      });
    } else {
      tips.push({
        icon: '🚜',
        title: 'स्प्रे व कृषि कार्य के लिए अनुकूल मौसम:',
        desc: 'आगामी 2-3 दिन मौसम साफ रहने का अनुमान है। कीटनाशक, टॉनिक या फफूंदनाशी का स्प्रे सुबह 8 से 11 बजे या शाम 4 बजे के बाद करें।'
      });
    }

    if (humidity > 75) {
      tips.push({
        icon: '🦠',
        title: 'उच्च नमी अलर्ट (Fungus Risk):',
        desc: 'हवा में अत्यधिक नमी (75%+) के कारण धान, सोयाबीन व सब्जियों में फफूंद व झुलसा रोग का खतरा बढ़ सकता है। पत्तों के नीचे काले/भूरे धब्बों की निगरानी करें।'
      });
    }

    if (maxTemp > 34) {
      tips.push({
        icon: '💧',
        title: 'सिंचाई व वाष्पीकरण प्रबंधन:',
        desc: 'तेज धूप और उच्च तापमान के कारण नमी तेजी से उड़ रही है। आवश्यकतानुसार शाम के समय हल्की सिंचाई करें।'
      });
    }

    tips.push({
      icon: '🌾',
      title: 'विशेषज्ञ सलाह (Aarogyam AI Expert):',
      desc: 'फसल में अज्ञात बीमारी दिखने पर 24×7 WhatsApp AI एक्सपर्ट से तत्काल फोटो भेजकर समाधान प्राप्त करें।'
    });

    advisoryWrap.innerHTML = `
      <div style="background: #0b192c; border: 2px solid #38bdf8; border-radius: 16px; padding: 22px; box-shadow: 0 8px 30px rgba(0,0,0,0.5);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:16px; border-bottom:1.5px solid rgba(56,189,248,0.3); padding-bottom:12px;">
          <div style="font-size:1.25rem; font-weight:900; color:#ffffff; display:flex; align-items:center; gap:8px;">
            <span>🌱</span> <span>विशेषज्ञ कृषि मौसम एडवाइजरी (Farmer Advisory)</span>
          </div>
          <span style="font-size:0.76rem; background:#38bdf8; color:#0b192c; font-weight:900; padding:4px 12px; border-radius:20px; box-shadow:0 2px 8px rgba(56,189,248,0.4);">
            Live AI Agro Guidance
          </span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
          ${tips.map(t => `
            <div style="background: #0f2744; border: 1.5px solid #1e3a8a; border-radius: 12px; padding: 14px 16px;">
              <div style="font-weight:900; font-size:1rem; color:#67e8f9; margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                <span>${t.icon}</span> <span>${t.title}</span>
              </div>
              <p style="margin:0; font-size:0.92rem; color:#ffffff; font-weight:600; line-height:1.6;">${t.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Dynamic CSS-Animated Weather Visual Generator
  function getAnimatedWeatherVisual(condition, iconChar) {
    if (condition === 'clear') {
      return `
        <div class="weather-anim-sun-core">
          <div class="weather-anim-sun-halo"></div>
          <span style="font-size: 2rem; line-height: 1;">☀️</span>
        </div>
      `;
    } else if (condition === 'partly_cloudy') {
      return `
        <div style="position:relative; width:65px; height:65px; display:flex; align-items:center; justify-content:center;">
          <div class="weather-anim-sun-core" style="width:34px; height:34px; position:absolute; top:4px; right:4px;">
            <div class="weather-anim-sun-halo" style="width:46px; height:46px;"></div>
          </div>
          <div class="weather-anim-cloud" style="position:absolute; bottom:4px; left:4px; font-size:2.2rem; filter:drop-shadow(0 3px 6px rgba(0,0,0,0.4));">
            ⛅
          </div>
        </div>
      `;
    } else if (condition === 'rain' || condition === 'drizzle') {
      return `
        <div style="position:relative; width:68px; height:68px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
          <div class="weather-anim-cloud" style="font-size:2.3rem; line-height:1;">🌧️</div>
          <div style="position:absolute; bottom:6px; left:12px; right:12px; display:flex; justify-content:space-around;">
            <div class="weather-raindrop" style="animation-delay:0s;"></div>
            <div class="weather-raindrop" style="animation-delay:0.25s;"></div>
            <div class="weather-raindrop" style="animation-delay:0.5s;"></div>
          </div>
        </div>
      `;
    } else if (condition === 'storm' || condition === 'heavy_rain' || condition === 'hail') {
      return `
        <div style="position:relative; width:68px; height:68px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
          <div class="weather-anim-cloud" style="font-size:2.3rem; line-height:1;">⛈️</div>
          <div class="weather-anim-lightning" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:2rem; color:#fde047; pointer-events:none;">
            ⚡
          </div>
          <div style="position:absolute; bottom:6px; left:10px; right:10px; display:flex; justify-content:space-around;">
            <div class="weather-raindrop" style="height:11px; animation-duration:0.5s; animation-delay:0s;"></div>
            <div class="weather-raindrop" style="height:11px; animation-duration:0.5s; animation-delay:0.2s;"></div>
            <div class="weather-raindrop" style="height:11px; animation-duration:0.5s; animation-delay:0.4s;"></div>
          </div>
        </div>
      `;
    } else if (condition === 'fog') {
      return `
        <div class="weather-anim-mist" style="display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:2.3rem;">
          🌫️
        </div>
      `;
    } else {
      return `
        <div class="weather-anim-cloud" style="font-size:2.4rem; line-height:1;">
          ☁️
        </div>
      `;
    }
  }

  function getSafeShareId() {
    let id = '';
    // 1. window.getUserShareId()
    if (typeof window.getUserShareId === 'function') {
      try { id = window.getUserShareId(); } catch(e) {}
    }
    // 2. window.V1_SESSION
    if (!id && window.V1_SESSION && typeof window.V1_SESSION.getUnifiedShareId === 'function') {
      try { id = window.V1_SESSION.getUnifiedShareId(); } catch(e) {}
    }
    // 3. localStorage keys
    if (!id) {
      try {
        const u = JSON.parse(localStorage.getItem('AI_USER') || localStorage.getItem('AI_PROFILE') || localStorage.getItem('currentUser') || '{}');
        if (u.share_id) id = u.share_id;
        else if (u.referral_code) id = u.referral_code;
        else if (u.mobile) {
          const m = String(u.mobile).replace(/\D/g, '').slice(-6);
          if (m.length === 6) id = 'AI' + m;
        }
      } catch(e) {}
    }
    // 4. aim_user_mobile
    if (!id) {
      const mob = (localStorage.getItem('aim_user_mobile') || '').replace(/\D/g, '').slice(-6);
      if (mob.length === 6) id = 'AI' + mob;
    }
    // 5. URL query params
    if (!id) {
      try {
        const qp = new URLSearchParams(window.location.search);
        const qId = qp.get('share_id') || qp.get('ref');
        if (qId) id = qId;
      } catch(e) {}
    }
    // 6. Security sanitize
    id = String(id || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!id || id.length < 3) {
      id = 'AI000004';
    }
    return id;
  }

  window.getDynamicWeatherShareText = function() {
    let s = window.AIM_CURRENT_WEATHER_STATE;
    if (!s) {
      // Build graceful fallback using saved preferences or DOM values
      const saved = getSavedUserWeatherPreference();
      const cityDom = document.getElementById('displayCityName')?.textContent?.trim();
      const tempDom = document.getElementById('displayTemp')?.textContent?.trim()?.replace('°C', '');
      const condDom = document.getElementById('displayCondition')?.textContent?.trim();
      const humDom = document.getElementById('displayHumidity')?.textContent?.trim()?.replace('%', '');
      const windDom = document.getElementById('displayWind')?.textContent?.trim()?.replace(' km/h', '');

      s = {
        cityName: (saved && saved.cityName) || (cityDom && !cityDom.includes('लोड') ? cityDom : 'राऊ / इंदौर'),
        stateName: (saved && saved.stateName) || 'मध्य प्रदेश',
        temp: parseInt(tempDom, 10) || 25,
        feelsLike: (parseInt(tempDom, 10) || 25) + 1,
        condition: condDom || 'साफ आसमान (Clear Sky)',
        humidity: parseInt(humDom, 10) || 62,
        windSpeed: parseInt(windDom, 10) || 7,
        rainProb: 20
      };
    }

    const shareId = getSafeShareId();
    const referralUrl = `https://aarogyamindia.online/weather.html?share_id=${encodeURIComponent(shareId)}&ref=${encodeURIComponent(shareId)}`;

    const isSpraySafe = (s.rainProb < 35 && s.windSpeed < 18 && s.temp < 36);
    let spraySection = '';
    if (isSpraySafe) {
      spraySection = `🚜 *दवाओं के स्प्रे की वैज्ञानिक सलाह (Spray Advisory):*\n🟢 *आज स्प्रे के लिए 100% उत्तम एवं अनुकूल मौसम!*\n• *मौसम स्थिति:* हवा शांत (${s.windSpeed} km/h) व वर्षा जोखिम केवल ${s.rainProb}% है।\n• *स्प्रे का सही समय:* सुबह 7:00 से 11:00 बजे अथवा शाम 4:00 से 6:30 बजे तक करें।\n• *असरदार फॉर्मूला टिप:* किसी भी कीटनाशक, फफूंदनाशी या टॉनिक में *बायो-99 (Bio-99)* सिलिकॉन स्टिकर अवश्य मिलाएं — इससे दवा पत्तों पर तुरंत फैलती है और बारिश में भी नहीं धुलती। कल्ले व फुटाव बढ़ाने हेतु *बायोफिट स्टीमरिच (Steamrich)* का छिड़काव करें।`;
    } else {
      let reasons = [];
      if (s.rainProb >= 35) reasons.push(`बारिश की ${s.rainProb}% संभावना (दवा बहने का खतरा)`);
      if (s.windSpeed >= 18) reasons.push(`तेज हवा ${s.windSpeed} km/h (ड्रिफ्ट/दवा उड़ने का खतरा)`);
      if (s.temp >= 36) reasons.push(`तेज धूप (${s.temp}°C) में वाष्पीकरण का खतरा`);
      spraySection = `🚜 *दवाओं के स्प्रे की वैज्ञानिक सलाह (Spray Advisory):*\n🔴 *आज दवाओं का छिड़काव तुरंत टालें / स्थगित रखें!*\n• *कारण:* ${reasons.join(', ')}।\n• *नुकसान से बचें:* आज स्प्रे करने पर महंगी दवा धुलने या उड़ने से पैसे व मेहनत की भारी बर्बादी होगी। मौसम साफ होने पर ही छिड़काव करें।`;
    }

    const rainAction = (s.rainProb >= 35)
      ? `🌧️ *सिंचाई व जल निकासी:* आगामी 24-48 घंटों में बारिश की संभावना है। सिंचाई तुरंत रोकें और खेत में जलभराव रोकने हेतु जल निकासी दुरुस्त रखें!`
      : `☀️ *सिंचाई प्रबंधन:* आगामी 7 दिन मौसम मुख्यतः शुष्क रहेगा। आवश्यकतानुसार शाम के समय हल्की सिंचाई करें ताकि मिट्टी में नमी बनी रहे।`;

    const fungusAlert = (s.humidity >= 70)
      ? `🦠 *फफूंद व रोग चेतावनी (High Alert):* हवा में अत्यधिक नमी (${s.humidity}%) के कारण धान, सोयाबीन व सब्जियों में झुलसा/ब्लाइट, पाउडरी मिल्ड्यू व सड़न रोग का खतरा अधिक है। जैविक रैप-अप (Wrap-up) का छिड़काव तैयार रखें।`
      : `🦠 *रोग व कीट स्थिति:* वर्तमान नमी स्तर (${s.humidity}%) पर रोग का जोखिम सामान्य है। नियमित जैविक पोषण जारी रखें।`;

    const fertilizerAdvice = (s.rainProb < 40)
      ? `🧪 *खाद व उर्वरक प्रबंधन:* खेत में पर्याप्त नमी होने पर शेत (SHET) जीवाणु खाद व एनपीके/डीएपी देने का सबसे उपयुक्त समय है। पोषक तत्व पौधों की जड़ों तक 100% पहुंचेंगे।`
      : `🧪 *खाद व उर्वरक प्रबंधन:* बारिश की संभावना को देखते हुए दानेदार यूरिया/खाद का प्रयोग टालें, खाद बहने का जोखिम है।`;

    return `🚨 *किसान मौसम व फसल सुरक्षा बुलेटिन — आरोग्यम इंडिया* 🚨\n\n📍 *क्षेत्र:* ${s.cityName} (${s.stateName})\n\n🌡️ *वर्तमान तापमान:* ${s.temp}°C (महसूस: ${s.feelsLike}°C)\n🌤️ *मौसम की स्थिति:* ${s.condition}\n💧 *हवा में नमी:* ${s.humidity}% | 💨 *हवा की गति:* ${s.windSpeed} km/h\n🌧️ *बारिश संभावना:* ${s.rainProb}%\n\n━━━━━━━━━━━━━━━━━━━━━━━\n${spraySection}\n\n━━━━━━━━━━━━━━━━━━━━━━━\n📅 *आगामी 7 दिनों के अनुसार खेत में क्या करें:*\n${rainAction}\n\n${fungusAlert}\n\n${fertilizerAdvice}\n\n━━━━━━━━━━━━━━━━━━━━━━━\n🌾 *10,000+ प्रगतिशील किसानों का भरोसेमंद मंच!*\n👉 अपने गाँव/तहसील का लाइव मौसम, सटीक 7-दिवसीय पूर्वानुमान, लाइव मंडी भाव, दैनिक कृषि पंचांग व 24×7 AI कृषि डॉक्टर अभी देखें:\n${referralUrl}\n\n_Aarogyam India — आधुनिक खेती, समृद्ध किसान_`;
  };

  function checkWeatherAuth(callback) {
    const isLogged = (window.isUserLoggedIn && typeof window.isUserLoggedIn === 'function')
      ? window.isUserLoggedIn()
      : ((window.V1_SESSION && typeof window.V1_SESSION.isLoggedIn === 'function') ? window.V1_SESSION.isLoggedIn() : false);

    if (!isLogged) {
      if (typeof window.openGuestLoginModal === 'function') {
        window.openGuestLoginModal(() => {
          if (typeof callback === 'function') callback();
        }, { force: false, source: 'WeatherShare' });
        return false;
      }
    }
    return true;
  }

  window.shareWeatherWhatsApp = function() {
    if (!checkWeatherAuth(() => window.shareWeatherWhatsApp())) return;
    const text = window.getDynamicWeatherShareText();
    if (!text) return;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window.recordModalShareEvent === 'function') {
      window.recordModalShareEvent('whatsapp_direct', window.location.href, 'किसान मौसम बुलेटिन');
    }
    window.open(url, '_blank');
  };

  // Universal floating share actions on weather page (Opens 5-Card Modal with rich dynamic weather text)
  const isWeatherPage = window.location.pathname.toLowerCase().includes('weather') || !!document.getElementById('weatherHeroVisual');
  if (isWeatherPage) {
    window.triggerUniversalPageShare = function() {
      if (!checkWeatherAuth(() => window.triggerUniversalPageShare())) return;
      const text = window.getDynamicWeatherShareText();
      if (typeof window.openUniversalShareModal === 'function') {
        window.openUniversalShareModal({
          title: 'किसान मौसम व फसल सुरक्षा बुलेटिन',
          text: text,
          url: window.location.href
        });
      } else {
        window.shareWeatherWhatsApp();
      }
    };
    window.triggerViralPageShare = window.triggerUniversalPageShare;
    window.triggerUniversalShare = window.triggerUniversalPageShare;
  }

  window.useUserCurrentLocation = function() {
    const btn = document.getElementById('btn-gps-weather');
    if (btn) btn.innerHTML = '⏳ GPS लोकेशन खोजी जा रही है...';

    async function fallbackToIpWeather() {
      let lat = null, lon = null, detectedCity = 'आपका क्षेत्र', detectedState = 'लाइव मौसम';
      try {
        const r1 = await fetch('https://ipapi.co/json/');
        if (r1.ok) {
          const d1 = await r1.json();
          if (d1.latitude && d1.longitude) {
            lat = d1.latitude;
            lon = d1.longitude;
            detectedCity = d1.city || d1.region || 'स्थानीय क्षेत्र';
            detectedState = d1.region || 'भारत';
          }
        }
      } catch(e) {}

      if (!lat) {
        try {
          const r2 = await fetch('https://api.bigdatacloud.net/data/client-info');
          if (r2.ok) {
            const d2 = await r2.json();
            if (d2.location && d2.location.latitude) {
              lat = d2.location.latitude;
              lon = d2.location.longitude;
              detectedCity = d2.location.city || d2.location.principalSubdivision || 'स्थानीय क्षेत्र';
              detectedState = d2.location.principalSubdivision || 'भारत';
            }
          }
        } catch(e) {}
      }

      if (!lat) {
        lat = 24.5362;
        lon = 81.3037;
        detectedCity = 'रीवा';
        detectedState = 'मध्य प्रदेश';
      }

      if (btn) btn.innerHTML = '📍 ' + detectedCity + ' (डिफ़ॉल्ट)';
      window.load7DayWeather('gps', lat, lon, detectedCity, detectedState);
    }

    if (!navigator.geolocation) {
      fallbackToIpWeather();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        let detectedCity = 'मेरी लाइव लोकेशन';
        let detectedState = 'GPS डिटेक्टेड';

        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=hi`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const district = geoData.locality || geoData.city || geoData.principalSubdivision;
            const state = geoData.principalSubdivision;
            if (district) detectedCity = `${district}`;
            if (state) detectedState = state;
          }
        } catch(e) {}

        if (btn) btn.innerHTML = '📍 ' + detectedCity + ' (डिफ़ॉल्ट)';
        window.load7DayWeather('gps', lat, lon, detectedCity, detectedState);
      },
      (err) => {
        console.warn('GPS unavailable on mobile, using smart IP fallback:', err);
        fallbackToIpWeather();
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  function bootWeatherApp() {
    const isWPage = window.location.pathname.toLowerCase().includes('weather') || !!document.getElementById('weatherHeroVisual');

    // 1. Check and restore saved location memory (e.g. Indore / Rau)
    const saved = getSavedUserWeatherPreference();
    if (saved && saved.lat && saved.lon) {
      window.load7DayWeather(saved.key || 'saved', saved.lat, saved.lon, saved.cityName, saved.stateName, true);
      const btn = document.getElementById('btn-gps-weather');
      if (btn && saved.cityName) {
        btn.innerHTML = `📍 ${saved.cityName} (डिफ़ॉल्ट)`;
        btn.title = 'आपकी सहेजी गई डिफ़ॉल्ट लोकेशन (पुनः GPS ट्रैक करने के लिए टैप करें)';
      }
      const selectEl = document.getElementById('weather-district-select');
      if (selectEl && saved.key && selectEl.querySelector(`option[value="${saved.key}"]`)) {
        selectEl.value = saved.key;
      }
    } else {
      // Default load Rewa
      window.load7DayWeather('rewa');
    }

    if (!isWPage) {
      return;
    }

    const selectEl = document.getElementById('weather-district-select');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          window.load7DayWeather(val);
          const btn = document.getElementById('btn-gps-weather');
          if (btn) {
            const opt = selectEl.options[selectEl.selectedIndex];
            btn.innerHTML = `📍 ${opt ? opt.text.split(' ')[0] : 'लोकेशन'} (डिफ़ॉल्ट)`;
          }
        }
      });
    }

    const searchInput = document.getElementById('citySearchInput');
    const searchBtn = document.getElementById('citySearchBtn');
    if (searchBtn && searchInput) {
      const handleSearch = () => {
        const q = searchInput.value.trim().toLowerCase();
        if (q) {
          const match = Object.keys(DISTRICT_COORDINATES).find(k => k.includes(q) || DISTRICT_COORDINATES[k].name.toLowerCase().includes(q));
          if (match) {
            window.load7DayWeather(match);
            const btn = document.getElementById('btn-gps-weather');
            if (btn) btn.innerHTML = `📍 ${DISTRICT_COORDINATES[match].name.split(' ')[0]} (डिफ़ॉल्ट)`;
          } else {
            window.load7DayWeather('rewa');
          }
        }
      };
      searchBtn.addEventListener('click', handleSearch);
      searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
    }

    // Initialize Weather Page Bottom Twin KPIs (Panchang & Mandi)
    initWeatherBottomTwinKpis();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootWeatherApp);
  } else {
    bootWeatherApp();
  }

  function initWeatherBottomTwinKpis() {
    const panchangWrap = document.getElementById('weather-kpi-panchang-data');
    if (panchangWrap && window.SakhiPanchang) {
      const p = window.SakhiPanchang.getPanchangForDate(new Date());
      panchangWrap.innerHTML = `
        <div style="font-weight: 900; font-size: 1.15rem; color: #ffffff;">${p.tithi}</div>
        <div style="font-size: 0.78rem; color: #fef3c7; margin-top: 3px;">⭐ नक्षत्र: <strong>${p.nakshatra}</strong> | 🌟 अभिजीत: <strong>${p.abhijitMuhurat.split(' ')[0]}</strong></div>
        <div style="font-size: 0.72rem; color: #fde68a; margin-top: 2px;">${p.agriGuidance.isShukla ? '🌱 शुक्ल पक्ष - ऊपर फलने वाली फसलें व स्प्रे उत्तम' : '🥔 कृष्ण पक्ष - कंद फसलें व शेत खाद उत्तम'}</div>
      `;
    }
  }

})();