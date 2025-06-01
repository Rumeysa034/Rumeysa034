document.addEventListener("DOMContentLoaded", () => {
   
    const cityInput = document.querySelector('.city-input');
    const searchBtn = document.querySelector('.search-btn');
    const weatherInfoSection = document.querySelector('.weather-info');
    const sehirArayinSection = document.querySelector('.Sehir-arayin');
    const sehirBulunamadiSection = document.querySelector('.Sehir-bulunamadi');
    const countryTxt = document.querySelector('.country-txt');
    const tempTxt = document.querySelector('.temp-txt');
    const conditionTxt = document.querySelector('.condition-txt');
    const nemValueTxt = document.querySelector('.Nem-value-txt');
    const rüzgarValueTxt = document.querySelector('.Rüzgar-value-txt');
    const weatherSummaryImg = document.querySelector('.weather-summary-img');
    const currentDateTxt = document.querySelector('.current-date-txt');
    const forecastItemsContainer = document.querySelector('.forecast-items-container');
    const getLocationBtn = document.getElementById('getLocationBtn');
    const openBtn = document.getElementById('openModal');
    const closeBtn = document.getElementById('closeModal');
    const modal = document.getElementById('modal');
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromUrl = urlParams.get('city');
    if (cityFromUrl) {
        cityInput.value = cityFromUrl;
        getWeatherData(cityFromUrl);
    }

    const apiKey = '4c2962a58e3bf2d4c7ac458234e17419';
    
    // Arama geçmişi dropdown'ı oluştur
    const historyDropdown = document.createElement('div');
    historyDropdown.className = 'history-dropdown';
    cityInput.parentNode.insertBefore(historyDropdown, cityInput.nextSibling);

   
    cityInput.addEventListener('click', () => {
        updateSuggestions();
        historyDropdown.style.display = 'block';
    });

    document.addEventListener('click', (e) => {
        if (!cityInput.contains(e.target) && !historyDropdown.contains(e.target)) {
            historyDropdown.style.display = 'none';
        }
    });

    searchBtn.addEventListener('click', async () => {
    const city = cityInput.value.trim();
    if (city) {
        try {
            await getWeatherData(city); 
            await saveToHistory(city); 
            cityInput.value = '';
            cityInput.blur();
            historyDropdown.style.display = 'none';
        } catch (error) {
            console.error("Hata:", error);
            showDisplaySection(sehirBulunamadiSection);
        }
    }
});
    
    cityInput.addEventListener('keydown', async (event) => {
    if (event.key === 'Enter' && cityInput.value.trim() !== '') {
        const city = cityInput.value.trim();
        try {
            await getWeatherData(city); 
            await saveToHistory(city);
            cityInput.value = '';
            historyDropdown.style.display = 'none';
        } catch (error) {
            console.error("Hata:", error);
            showDisplaySection(sehirBulunamadiSection);
        }
    }
});

    async function getFetchData(endPoint, city) { 
        const apiUrl = `https://api.openweathermap.org/data/2.5/${endPoint}?q=${city}&appid=${apiKey}&units=metric&lang=tr`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("şehir bulunamadı");
        return response.json();
    }


    function getWeatherIcon(id) {
        if (id <= 232) return 'thunderstorm.svg';
        if (id <= 321) return 'drizzle.svg';
        if (id <= 531) return 'rain.svg';
        if (id <= 622) return 'snow.svg';
        if (id <= 781) return 'atmosphere.svg';
        if (id === 800) return 'clear.svg';
        return 'cloudy.svg';
    }

    function getCurrentDate() {
        const currentDate = new Date(); 
        const options = {
            weekday: 'short',
            day: '2-digit',
            month: 'short'
        };
        return currentDate.toLocaleDateString('tr-TR', options);
    }

    async function getWeatherData(city) { 
        try {
            const weatherData = await getFetchData('weather', city);

            if(weatherData.cod != 200) {
                sehirArayinSection.style.display = 'none';
                showDisplaySection(sehirBulunamadiSection);
                return;
            }
            //güncelleme
            const {
                name: country,
                main: { temp, humidity },
                weather: [{ id, description }],
                wind: { speed }
            } = weatherData;

            countryTxt.textContent = country;
            tempTxt.textContent = Math.round(temp) + '°C';
            conditionTxt.textContent = description;
            weatherSummaryImg.src = `./bilesenler/${getWeatherIcon(id)}`;
            nemValueTxt.textContent = humidity + '%';
            rüzgarValueTxt.textContent = speed + ' M/s';
            currentDateTxt.textContent = getCurrentDate();
           
if (temp < 7) {
    alert("Hava 7 derecenin altında, sıkı giyin!");
}
if (temp > 30) {
    alert("Hava 30 derecenin üstünde, bol su içmeyi unutma!");
}
            await upDateForecastsInfo(city); 
            showDisplaySection(weatherInfoSection);
        } catch (error) {
            console.error("Hava durumu verisi alınamadı:", error);
            showDisplaySection(sehirBulunamadiSection);
        }
    }

    async function upDateForecastsInfo(city) {
        const forecastsData = await getFetchData('forecast', city);
        const timeTaken = '12:00:00';
        const todayDate = new Date().toISOString().split('T')[0]; 
        forecastItemsContainer.innerHTML = ''; 
        
        forecastsData.list.forEach(forecastWeather => { 
            if(forecastWeather.dt_txt.includes(timeTaken) && 
               !forecastWeather.dt_txt.includes(todayDate)) {
                updateWeatherItems(forecastWeather);
            }
        });
    }

    function updateWeatherItems(weatherData) {
        const {
            dt_txt: date,
            weather: [{ id }],
            main: { temp }
        } = weatherData;

        const dateTaken = new Date(date);
        const dateOption = {
            day: '2-digit',
            month: 'short'
        };
        const dateResult = dateTaken.toLocaleDateString('tr-TR', dateOption);

        const forecastItem = `
            <div class="forecast-item">
                <h5 class="forecast-item-date regular-txt">${dateResult}</h5>
                <img src="bilesenler/${getWeatherIcon(id)}" class="forecast-item-img">
                <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5> 
            </div> `;
        forecastItemsContainer.insertAdjacentHTML('beforeend', forecastItem);
    }

    function showDisplaySection(section) {
        [weatherInfoSection, sehirArayinSection, sehirBulunamadiSection]
            .forEach(sec => sec.style.display = 'none');
        section.style.display = 'flex';
    }


    getLocationBtn.addEventListener("click", function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        } else {
            alert("Tarayıcınız konum almayı desteklemiyor.");
        }
    });

    function errorCallback(error) {
        console.error("Konum alma hatası:", error);
        alert("Konum bilgisi alınırken bir hata oluştu.");
    }

    function successCallback(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        .then(response => response.json())
        .then(data => {
            const city = data.address.city || data.address.town || data.address.village;
            if (city) {
                getWeatherData(city);
            } else {
                alert("Konumdan şehir bilgisi alınamadı.");
            }
        })
        .catch(error => {
            console.error("Konumdan şehir alma hatası:", error);
            alert("Konumdan şehir alınırken bir hata oluştu.");
        });
}

    function saveToHistory(city) {
        return fetch('http://localhost:3000/api/history', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city })
        })
        .then(res => res.json())
        .then(data => {
            console.log("Veri başarıyla kaydedildi:", data);
            updateSuggestions();
        })
        .catch(err => console.error("Geçmişe kaydetme hatası:", err));
    }

    function updateSuggestions() {
        fetch('http://localhost:3000/api/history') 
            .then(res => res.json())
            .then(data => {
                historyDropdown.innerHTML = '';
                const uniqueCities = [...new Set(data)];
                uniqueCities.slice(0, 5).forEach(city => {
                    const item = document.createElement('div');
                    item.className = 'history-item';
                    item.textContent = city;
                    item.addEventListener('click', () => {
                        cityInput.value = city;
                        getWeatherData(city);
                        historyDropdown.style.display = 'none';
                    });
                    historyDropdown.appendChild(item);
                });
            })
            .catch(err => console.error("Geçmiş getirme hatası:", err));
    }
    updateSuggestions();

    openBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (!city) {
            alert ("lütfen önve bir şehir ismi girin");
            return;
        }
        modal.classList.add("open");
        const qrVerisi = `https://rumeysa034.github.io/Rumeysa034/?city=${encodeURIComponent(city)}`;

    qrKodGoster(qrVerisi);
    console.log("qr kod içeriği:", qrVerisi);
    // QR kod okutulduğunda yönlendirme için örnek:
    
});
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("open");
    });

    function qrKodGoster(veri) {
    const qrDiv = document.getElementById("qrcode");
    qrDiv.innerHTML = ""; // Önceki QR kodu sil
    qrDiv.style = "";
    new QRCode(qrDiv, {
        text: veri,
        width: 200,
        height: 200,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}

 });
