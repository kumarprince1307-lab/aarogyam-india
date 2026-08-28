// ==========================================================
// AAROGYAM INDIA - MANDI MARKET & WEATHER JS (FULL & COMPLETE)
// ==========================================================

const weatherApiKey = "5de1161b414b81d13341268e6ad6ec34";
const dataGovApiKey = "579b464db66ec23bdd0000014cad2903895d42966975ac5bf6597bfe"; 

// भारत के सभी राज्यों और उनके जिलों का कम्पलीट डेटा बैंक
const stateDistrictsMap = {
    "Madhya Pradesh": ["Bhopal", "Indore", "Rewa", "Gwalior", "Jabalpur", "Ujjain", "Satna", "Sagar", "Dewas", "Ratlam", "Sidhi", "Singrauli", "Shahdol", "Chhatarpur", "Damoh", "Panna", "Tikamgarh", "Niwari", "Murwara (Katni)", "Sehore", "Raisen", "Vidisha", "Rajgarh", "Betul", "Harda", "Hoshangabad (Narmadapuram)", "Burhanpur", "Khandwa", "Khargone (West Nimar)", "Barwani", "Alirajpur", "Jhabua", "Dhar", "Neemuch", "Mandsaur", "Shajapur", "Agar Malwa", "Guna", "Ashoknagar", "Shivpuri", "Datia", "Bhind", "Morena", "Sheopur", "Balaghat", "Chhindwara", "Seoni", "Mandla", "Dindori", "Narsinghpur"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Varanasi", "Agra", "Meerut", "Prayagraj", "Gorakhpur", "Ghaziabad", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Noida (Gautam Buddh Nagar)", "Ayodhya", "Mathura", "Jhansi", "Muzaffarnagar", "Azamgarh", "Sultanpur", "Sitapur", "Hardoi", "Lakhimpur Kheri", "Barabanki", "Unnao", "Rae Bareli", "Faizabad", "Basti", "Gonda", "Bahraich", "Mirzapur", "Jaunpur", "Ghazipur", "Ballia", "Deoria", "Kushinagar", "Maharajganj", "Siddharthnagar", "Sant Kabir Nagar", "Banda", "Chitrakoot", "Hamirpur", "Mahoba", "Lalitpur", "Jalaun", "Etah", "Kasganj", "Mainpuri", "Firozabad", "Hathras", "Budaun", "Shahjahanpur", "Pilibhit", "Rampur", "Bijnor", "Amroha", "Sambhal", "Shamli", "Baghpat", "Bulandshahr", "Hapur", "Amethi", "Kaushambi", "Fatehpur", "Pratapgarh", "Bhadohi", "Sonbhadra", "Chandauli"],
    "Maharashtra": ["Mumbai", "Mumbai Suburban", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Thane", "Palghar", "Raigad", "Ratnagiri", "Dhule", "Jalgaon", "Ahmednagar", "Beed", "Nanded", "Latur", "Parbhani", "Akola", "Yavatmal", "Wardha", "Chandrapur", "Satara", "Sangli"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara", "Sikar", "Pali", "Bharatpur", "Sri Ganganagar", "Churu", "Barmer", "Jhunjhunu", "Hanumangarh", "Tonk", "Chittorgarh", "Banswara", "Dungarpur", "Jhalawar", "Baran", "Bundi", "Nagaur", "Jaisalmer"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Anand", "Navsari", "Morbi", "Mehsana", "Bharuch", "Valsad", "Porbandar", "Patan", "Amreli", "Surendranagar", "Dahod", "Kheda (Nadiad)"],
    "Bihar": ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Purnia", "Darbhanga", "Bihar Sharif (Nalanda)", "Arrah (Bhojpur)", "Begusarai", "Katihar", "Munger", "Chhapra (Saran)", "Saharsa", "Sasaram", "Hajipur", "Siwan", "Bettiah", "Motihari", "Madhubani", "Sitamarhi", "Kishanganj", "Jehanabad", "Aurangabad", "Nawada", "Buxar"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Durg", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur (Bastar)", "Ambikapur (Sarguja)", "Dhamtari", "Mahasamund", "Kanker", "Jashpur"],
    "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Hisar", "Karnal", "Rohtak", "Sonipat", "Yamunanagar", "Panchkula", "Bhiwani", "Sirsa", "Jind", "Fatehabad"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali (SAS Nagar)", "Pathankot", "Hoshiarpur", "Moga", "Abohar", "Malerkotla", "Sangrur", "Faridkot", "Gurdaspur"],
    "Karnataka": ["Bengaluru", "Mysuru", "Hubballi-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davangere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukkudi", "Dindigul", "Thanjavur"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati", "Kakinada", "Kadapa", "Anantapur"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
    "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda"]
};

// स्टेट बदलने पर जिले का ड्रॉपडाउन अपडेट करने का फंक्शन
function updateDistrictDropdown() {
    const stateSelect = document.getElementById('stateSelect');
    const districtSelect = document.getElementById('districtSelect');
    if (!stateSelect || !districtSelect) return;
    
    const selectedState = stateSelect.value;
    districtSelect.innerHTML = '<option value="">सभी जिले (All Districts)</option>';

    if (selectedState && stateDistrictsMap[selectedState]) {
        stateDistrictsMap[selectedState].forEach(district => {
            const opt = document.createElement('option');
            opt.value = district;
            opt.textContent = district;
            districtSelect.appendChild(opt);
        });
    }
}

// लाइव मौसम और समय फेच करने का फंक्शन
async function fetchWeatherAndClock(city = "Rewa") {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const dateEl = document.getElementById('liveDateTimeDisplay');
    if (dateEl) dateEl.innerText = `📅 ${now.toLocaleDateString('hi-IN', options)}`;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${weatherApiKey}&lang=hi`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.cod === 200) {
            const cityNameEl = document.getElementById('displayCityName');
            const tempEl = document.getElementById('displayTemp');
            const condEl = document.getElementById('displayCondition');
            const iconEl = document.getElementById('weatherIconImg');
            
            if (cityNameEl) cityNameEl.innerText = data.name;
            if (tempEl) tempEl.innerText = Math.round(data.main.temp) + "°C";
            if (condEl) condEl.innerText = data.weather[0].description;
            if (iconEl) iconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

            const sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const sunriseEl = document.getElementById('sunriseTime');
            const sunsetEl = document.getElementById('sunsetTime');
            if (sunriseEl) sunriseEl.innerText = sunriseTime;
            if (sunsetEl) sunsetEl.innerText = sunsetTime;
        }
    } catch (err) {
        console.error("Weather error:", err);
    }
}

// मंडी भाव डेटा फेच करने का मुख्य फंक्शन
let currentMandiRecords = [];

async function fetchMandiPrices() {
    const gridContainer = document.getElementById('mandiDataGrid');
    if (!gridContainer) return;

    gridContainer.innerHTML = `<div class="mandi-placeholder-box"><i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:#10B981;"></i><p>मंडी भाव डेटा लोड हो रहा है...</p></div>`;

    const stateSelect = document.getElementById('stateSelect');
    const districtSelect = document.getElementById('districtSelect');
    const commoditySelect = document.getElementById('commoditySelect');
    const fromDateInput = document.getElementById('fromDateInput');
    const toDateInput = document.getElementById('toDateInput');
    const sortFieldSelect = document.getElementById('sortFieldSelect');
    const sortOrderSelect = document.getElementById('sortOrderSelect');

    const stateVal = stateSelect ? stateSelect.value : "";
    const districtVal = districtSelect ? districtSelect.value : "";
    const commodityVal = commoditySelect ? commoditySelect.value : "";
    const fromDate = fromDateInput ? fromDateInput.value : "";
    const toDate = toDateInput ? toDateInput.value : "";
    const sortField = sortFieldSelect ? sortFieldSelect.value : "market";
    const sortOrder = sortOrderSelect ? sortOrderSelect.value : "asc";

    let apiUrl = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${dataGovApiKey}&format=json&limit=150`;

    try {
        const response = await fetch(apiUrl);
        const result = await response.json();

        if (result && result.records && result.records.length > 0) {
            let records = result.records;

            if (stateVal) {
                records = records.filter(item => {
                    const st = item.state || item.State || "";
                    return st.toLowerCase().includes(stateVal.toLowerCase());
                });
            }
            if (districtVal) {
                records = records.filter(item => {
                    const dist = item.district || item.District || "";
                    return dist.toLowerCase().includes(districtVal.toLowerCase());
                });
            }
            if (commodityVal) {
                records = records.filter(item => {
                    const comm = item.commodity || item.Commodity || "";
                    return comm.toLowerCase().includes(commodityVal.toLowerCase());
                });
            }

            if (fromDate || toDate) {
                records = records.filter(item => {
                    const dateStr = item.arrival_date || item.Arrival_Date || "";
                    if (!dateStr) return false;
                    const parts = dateStr.split('/');
                    if (parts.length !== 3) return true;
                    const itemDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
                    
                    let pass = true;
                    if (fromDate && itemDate < new Date(fromDate)) pass = false;
                    if (toDate && itemDate > new Date(toDate)) pass = false;
                    return pass;
                });
            }

            records.sort((a, b) => {
                let valA = a[sortField] || a[sortField.charAt(0).toUpperCase() + sortField.slice(1)] || '';
                let valB = b[sortField] || b[sortField.charAt(0).toUpperCase() + sortField.slice(1)] || '';
                if (sortField === 'modal_price') {
                    valA = parseFloat(valA) || 0;
                    valB = parseFloat(valB) || 0;
                }
                if (sortOrder === 'asc') return valA > valB ? 1 : -1;
                else return valA < valB ? 1 : -1;
            });

            // प्रति पेज केवल 20 रिकॉर्ड्स दिखाने के लिए लिमिट सेट करना
            currentMandiRecords = records.length > 0 ? records.slice(0, 20) : result.records.slice(0, 20);
            renderMandiTable(currentMandiRecords);
        } else {
            gridContainer.innerHTML = `<div class="mandi-placeholder-box" style="color:#f87171;"><p>डेटा प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।</p></div>`;
            currentMandiRecords = [];
        }
    } catch (error) {
        console.error("Mandi API Error:", error);
        gridContainer.innerHTML = `<div class="mandi-placeholder-box" style="color:#f87171;"><p>कनेक्शन में समस्या आई। कृपया इंटरनेट कनेक्शन जांचें।</p></div>`;
    }
}

// 6 अलग-अलग ग्रिड कॉलम में डेटा रेंडर करने वाला परफेक्ट फंक्शन
function renderMandiTable(records) {
    const gridContainer = document.getElementById('mandiDataGrid');
    if (!gridContainer) return;

    let htmlContent = "";
    records.forEach(item => {
        const commName = item.commodity || item.Commodity || 'N/A';
        const stateName = item.state || item.State || 'N/A';
        const distName = item.district || item.District || '';
        const marketName = item.market || item.Market || 'N/A';
        const varietyName = item.variety || item.Variety || item.grade || item.Grade || 'FAQ';
        const arrDate = item.arrival_date || item.Arrival_Date || '--';
        const minPrice = item.min_price || item.Min_Price || '--';
        const maxPrice = item.max_price || item.Max_Price || '--';
        const modalPrice = item.modal_price || item.Modal_Price || item.modalprice || '--';

        htmlContent += `
            <div class="table-data-row">
                <div style="color: #ffffff; font-weight: 600;">${commName}</div>
                <div style="color: #ffffff;">${stateName}<br><small style="color: #38bdf8;">${distName}</small></div>
                <div style="color: #ffffff;">${marketName}</div>
                <div style="color: #a7f3d0; font-weight: 500;">${varietyName}</div>
                <div style="color: #cbd5e1;"><small>${arrDate}</small></div>
                <div><span style="color: #facc15; font-weight: 700; font-size: 1.05rem;">₹${modalPrice}</span><br><small style="color: #94a3b8;">(Min: ₹${minPrice} | Max: ₹${maxPrice})</small></div>
            </div>
        `;
    });
    gridContainer.innerHTML = htmlContent;
}

// CSV डाउनलोड करने का फंक्शन
function downloadCSV() {
    if (!currentMandiRecords || currentMandiRecords.length === 0) {
        alert("डाउनलोड करने के लिए कोई डेटा उपलब्ध नहीं है। पहले सर्च करें।");
        return;
    }
    let csv = 'State,District,Market,Commodity,Variety,Min Price,Max Price,Modal Price,Arrival Date\n';
    currentMandiRecords.forEach(row => {
        csv += `"${row.state || row.State || ''}","${row.district || row.District || ''}","${row.market || row.Market || ''}","${row.commodity || row.Commodity || ''}","${row.variety || row.Variety || ''}","${row.min_price || ''}","${row.max_price || ''}","${row.modal_price || row.Modal_Price || ''}","${row.arrival_date || row.Arrival_Date || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "aarogyam_mandi_prices.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// फॉर्म रीसेट करने का फंक्शन
function resetMandiForm() {
    const stateSelect = document.getElementById('stateSelect');
    const districtSelect = document.getElementById('districtSelect');
    const commoditySelect = document.getElementById('commoditySelect');
    const fromDateInput = document.getElementById('fromDateInput');
    const toDateInput = document.getElementById('toDateInput');
    const sortFieldSelect = document.getElementById('sortFieldSelect');
    const sortOrderSelect = document.getElementById('sortOrderSelect');

    if (stateSelect) stateSelect.value = "";
    if (districtSelect) districtSelect.innerHTML = '<option value="">पहले राज्य चुनें</option>';
    if (commoditySelect) commoditySelect.value = "";
    if (fromDateInput) fromDateInput.value = "";
    if (toDateInput) toDateInput.value = "";
    if (sortFieldSelect) sortFieldSelect.value = "market";
    if (sortOrderSelect) sortOrderSelect.value = "asc";
    
    fetchMandiPrices();
}

// पेज लोड होने पर इनिशियलाइज़ेशन
document.addEventListener('DOMContentLoaded', () => {
    fetchWeatherAndClock("Rewa");
    fetchMandiPrices();

    const stateSelect = document.getElementById('stateSelect');
    if (stateSelect) {
        stateSelect.addEventListener('change', updateDistrictDropdown);
    }

    const previewBtn = document.getElementById('previewBtn');
    if (previewBtn) {
        previewBtn.addEventListener('click', fetchMandiPrices);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetMandiForm);
    }

    const csvBtn = document.getElementById('csvDownloadBtn');
    if (csvBtn) {
        csvBtn.addEventListener('click', downloadCSV);
    }

    // वेदर शहर सर्च इवेंट
    const weatherBtn = document.getElementById('weatherCitySearchBtn');
    const weatherInput = document.getElementById('weatherCityInput');
    if (weatherBtn && weatherInput) {
        weatherBtn.addEventListener('click', () => {
            const cityName = weatherInput.value.trim();
            if (cityName) fetchWeatherAndClock(cityName);
        });
        weatherInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const cityName = weatherInput.value.trim();
                if (cityName) fetchWeatherAndClock(cityName);
            }
        });
    }
});