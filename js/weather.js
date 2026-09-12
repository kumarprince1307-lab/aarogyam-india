// Aarogyam India - Advanced 7-Day Visual Weather & Agrometeorological Advisory Engine (V25 Pro)
// Uses Free Open-Meteo API with 1-Hour Zero-Egress LocalStorage Caching

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

  window.load7DayWeather = async function(locationKey, userLat = null, userLon = null, customCityName = '', customStateName = '') {
    let lat, lon, displayName, displayState;

    if (userLat && userLon) {
      lat = userLat;
      lon = userLon;
      displayName = customCityName || 'मेरी लाइव लोकेशन';
      displayState = customStateName || 'GPS ऑटो-डिटेक्ट';
    } else {
      const loc = DISTRICT_COORDINATES[locationKey.toLowerCase()] || DISTRICT_COORDINATES['rewa'];
      lat = loc.lat;
      lon = loc.lon;
      displayName = loc.name;
      displayState = loc.state;
    }

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

    // Update Current Weather Card
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
    if (iconEl) iconEl.innerHTML = `<span style="font-size:3.5rem;line-height:1;">${wInfo.icon}</span>`;
    if (feelsEl) feelsEl.textContent = `${feelsLike}°C`;
    if (humidityEl) humidityEl.textContent = `${humidity}%`;
    if (windEl) windEl.textContent = `${windSpeed} km/h`;

    // Render 7-Day Forecast Grid
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
          <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid ${idx === 0 ? '#f59e0b' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 14px 10px; text-align: center; color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.25);">
            <div style="font-size: 0.85rem; font-weight: 800; color: ${idx === 0 ? '#fde047' : '#94a3b8'}; margin-bottom: 6px;">
              ${dayName}
            </div>
            <div style="font-size: 0.72rem; color: #64748b; margin-bottom: 8px;">
              ${d.getDate()} ${['जन', 'फर', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सितं', 'अक्टू', 'नव', 'दिसं'][d.getMonth()]}
            </div>
            <div style="font-size: 2rem; margin: 4px 0;">
              ${info.icon}
            </div>
            <div style="font-size: 0.78rem; color: #e2e8f0; font-weight: 700; min-height: 32px; display: flex; align-items: center; justify-content: center;">
              ${info.desc}
            </div>
            <div style="display: flex; justify-content: center; gap: 8px; font-size: 0.88rem; font-weight: 800; margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.1);">
              <span style="color: #f87171;">${maxTemp}°</span>
              <span style="color: #60a5fa;">${minTemp}°</span>
            </div>
            ${rainProb > 20 ? `
              <div style="margin-top: 6px; font-size: 0.72rem; color: #38bdf8; font-weight: 800; background: rgba(56,189,248,0.15); padding: 2px 4px; border-radius: 4px;">
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

    // Render Agrometeorological Advisory Box
    renderAgroAdvisory(current, daily);
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
      <div style="background: linear-gradient(135deg, rgba(22,163,74,0.15), rgba(6,78,59,0.25)); border: 2px solid #16a34a; border-radius: 16px; padding: 22px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:14px; border-bottom:1px solid rgba(22,163,74,0.3); padding-bottom:10px;">
          <div style="font-size:1.15rem; font-weight:900; color:#4ade80; display:flex; align-items:center; gap:8px;">
            <span>🌱</span> <span>विशेषज्ञ कृषि मौसम एडवाइजरी (Farmer Advisory)</span>
          </div>
          <span style="font-size:0.75rem; background:#16a34a; color:#fff; font-weight:800; padding:3px 10px; border-radius:20px;">
            Live AI Agro Guidance
          </span>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
          ${tips.map(t => `
            <div style="background: rgba(15,23,42,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 14px;">
              <div style="font-weight:800; font-size:0.92rem; color:#fde047; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
                <span>${t.icon}</span> <span>${t.title}</span>
              </div>
              <p style="margin:0; font-size:0.84rem; color:#e2e8f0; line-height:1.5;">${t.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  window.useUserCurrentLocation = function() {
    if (!navigator.geolocation) {
      alert('आपके ब्राउज़र में GPS लोकेशन सपोर्ट नहीं है। कृपया लिस्ट से अपना जिला चुनें।');
      return;
    }
    const btn = document.getElementById('btn-gps-weather');
    if (btn) btn.innerHTML = '⏳ GPS लोकेशन खोजी जा रही है...';

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

        if (btn) btn.innerHTML = '📍 ' + detectedCity;
        window.load7DayWeather('gps', lat, lon, detectedCity, detectedState);
      },
      (err) => {
        if (btn) btn.innerHTML = '📍 मेरा जिला खोजें';
        alert('लोकेशन एक्सेस की अनुमति नहीं मिली। कृपया नीचे दिए गए जिलों में से चुनें।');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Default load Rewa
    window.load7DayWeather('rewa');

    const selectEl = document.getElementById('weather-district-select');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) window.load7DayWeather(val);
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
          } else {
            window.load7DayWeather('rewa');
          }
        }
      };
      searchBtn.addEventListener('click', handleSearch);
      searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSearch(); });
    }
  });

})();