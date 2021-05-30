// API key for Open Weather Map
const APIKey = '70db0aba6c905e5d9292d4c254ac0d53';

//Search variables
const input = document.getElementById('citySearch');
const searchBtn = document.getElementById('search-button');
const cityName = document.getElementById('city-name');

//Current results variables
const weatherImg = document.getElementById('weatherImg');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const UV = document.getElementById('UV');
const history = document.getElementById('history');

//Event for button click and recalling history item
let searchHistory = JSON.parse(localStorage.getItem('search')) || [];
console.log(searchHistory);

searchBtn.addEventListener('click', function () {
    const searchTerm = input.value;
    weatherEl(searchTerm);
    searchHistory.push(searchTerm);
    localStorage.setItem('search', JSON.stringify(searchHistory));
    renderHistory();
})

// Rendering search history
function renderHistory() {
    history.innerHTML = '';
    for (let i = 0; i < searchHistory.length; i++) {
        const historyItem = document.createElement('input');
        historyItem.setAttribute('type', 'button');
        historyItem.setAttribute('class', 'form-control d-block bg-white');
        historyItem.setAttribute('value', searchHistory[i]);
        historyItem.addEventListener('click', function () {
            weatherEl(historyItem.value);
        })
        history.append(historyItem);
    }
}
renderHistory();

//Main function to pull api responses
function weatherEl(city) {
    let apiQuery = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + APIKey;

    //Using axios to get data from Open Weather Map
    axios.get(apiQuery)
        .then(function (response) {

            //Display current date
            const currentDate = new Date(response.data.dt * 1000);
            const day = currentDate.getDate();
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            cityName.innerHTML = response.data.name + ' (' + month + '/' + day + '/' + year + ') ';

            console.log(currentDate);
            
            //Display image for current weather condition
            let weatherPic = response.data.weather[0].icon;
            weatherImg.setAttribute('src', 'https://openweathermap.org/img/wn/' + weatherPic + '@2x.png');
            weatherImg.setAttribute('alt', response.data.weather[0].description);
            
            //Display data for current temperature, humidity and wind
            temperature.innerHTML = 'Temperature: ' + k2f(response.data.main.temp) + ' &#176F';
            humidity.innerHTML = 'Humidity: ' + response.data.main.humidity + '%';
            wind.innerHTML = 'Wind Speed: ' + response.data.wind.speed + ' MPH';
            
            //Using coordinates to find UV index of the city
            let lat = response.data.coord.lat;
            let lon = response.data.coord.lon;
            let UVapiQuery = 'https://api.openweathermap.org/data/2.5/uvi/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + APIKey + '&cnt=1';
            axios.get(UVapiQuery)
                .then(function (response) {
                    let UVIndex = document.createElement('span');
                    //Displays UV index with badge
                    UVIndex.setAttribute('class', 'badge badge-warning');
                    UVIndex.innerHTML = response.data[0].value;
                    UV.innerHTML = 'UV Index: ';
                    UV.append(UVIndex);
                });


            //Function to get forecasted data
            let cityID = response.data.id;
            let forecastQuery = 'https://api.openweathermap.org/data/2.5/forecast?id=' + cityID + '&appid=' + APIKey;
            axios.get(forecastQuery)
                .then(function (response) {
                    //Parse data from response to display the 5 day forecast
                    const forecast = document.querySelectorAll('.forecast');
                    for (i = 0; i < forecast.length; i++) {
                        forecast[i].innerHTML = '';
                        const forecastIndex = i * 8 + 2;
                        
                        //Display forecast date
                        const forecastDate = new Date(response.data.list[forecastIndex].dt * 1000);
                        const forecastDay = forecastDate.getDate();
                        const forecastMonth = forecastDate.getMonth() + 1;
                        const forecastYear = forecastDate.getFullYear();
                        const forecastDateEl = document.createElement('p');
                        forecastDateEl.setAttribute('class', 'mt-3 mb-0 forecast-date');
                        forecastDateEl.innerHTML = forecastMonth + '/' + forecastDay + '/' + forecastYear;
                        forecast[i].append(forecastDateEl);

                        //Display forecast weather condition image
                        const forecastWeatherEl = document.createElement('img');
                        forecastWeatherEl.setAttribute('src', 'https://openweathermap.org/img/wn/' + response.data.list[forecastIndex].weather[0].icon + '@2x.png');
                        forecastWeatherEl.setAttribute('alt', response.data.list[forecastIndex].weather[0].description);
                        forecast[i].append(forecastWeatherEl);
                        
                        //Display forecast temperature
                        const forecastTempEl = document.createElement('p');
                        forecastTempEl.innerHTML = 'Temp: ' + k2f(response.data.list[forecastIndex].main.temp) + ' &#176F';
                        forecast[i].append(forecastTempEl);
                        
                        //Display forecast humidity
                        const forecastHumidityEl = document.createElement('p');
                        forecastHumidityEl.innerHTML = 'Humidity: ' + response.data.list[forecastIndex].main.humidity + '%';
                        forecast[i].append(forecastHumidityEl);

                        console.log(response);
                    }
                })
                console.log(response);
        });
}

//Function to get temperature in F
function k2f(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
}

// Clearing local storage
const clearBtn = document.getElementById('clear-history');

clearBtn.addEventListener('click', function () {
    localStorage.clear();
    location.reload();
})