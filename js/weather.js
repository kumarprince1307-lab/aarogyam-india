// Aarogyam India - Weather API Integration
const apiKey = "5de1161b414b81d13341268e6ad6ec34";
const defaultCity = "indore";

async function fetchWeather(cityName) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${apiKey}&lang=hi`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            // HTML के एलिमेंट्स में डेटा अपडेट करें
            document.getElementById('displayCityName').innerText = data.name;
            document.getElementById('displayCountry').innerText = data.sys.country || "India";
            document.getElementById('displayTemp').innerText = Math.round(data.main.temp) + "°C";
            document.getElementById('displayCondition').innerText = data.weather[0].description;

            // ओपनवेदर का लाइव आइकॉन इमेज सेट करें
            const iconCode = data.weather[0].icon;
            document.getElementById('weatherIconImg').src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        } else {
            alert("शहर का नाम नहीं मिला, कृपया सही नाम दर्ज करें।");
        }
    } catch (error) {
        console.error("मौसम डेटा लाने में त्रुटि:", error);
    }
}

// पेज लोड होने पर और सर्च करने पर एक्शन
document.addEventListener('DOMContentLoaded', () => {
    // डिफ़ॉल्ट शहर (रीवा) का मौसम लोड करें
    fetchWeather(defaultCity);

    const searchBtn = document.getElementById('citySearchBtn');
    const searchInput = document.getElementById('citySearchInput');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const cityName = searchInput.value.trim();
            if (cityName) {
                fetchWeather(cityName);
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cityName = searchInput.value.trim();
                if (cityName) {
                    fetchWeather(cityName);
                }
            }
        });
    }
});