// Define the API key for the weather API
const WEATHER_API_KEY = "871cd2f61f9b7922aecdb5aa1ff191f9";

// Get DOM elements
const searchBtn = document.querySelector("#search-button");
const userInput = document.querySelector("#user-search-input");
const recentSearch = document.querySelector("#recent-search");

// Initialize city array list from local storage or use an empty array
let cityArrList = JSON.parse(localStorage.getItem("cities")) || [];

// Set the current city as the last city in the array or default to "New York"
let city = cityArrList[cityArrList.length - 1] || "New York";

// Add event listener to the search button
searchBtn.addEventListener("click", () => {
  // Get the value from the user input and trim any leading/trailing whitespace
  const cityInput = userInput.value.trim().toLowerCase();

  // Convert the searched city to title case
  const searchedCity = toTitleCase(cityInput);

  // Check if a valid city is entered
  if (searchedCity) {
    // Update the current city
    city = searchedCity;

    // Save the recent search
    saveRecentSearch(searchedCity);

    // Perform weather and geolocation search for the city
    searchCityWeather(searchedCity);
    searchCityGeo(searchedCity);
  }
});

// Function to fetch weather data for a given city
function searchCityWeather(city) {
  const weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${WEATHER_API_KEY}`;

  // Fetch weather data from the API
  fetch(weatherURL)
    .then((response) => response.json())
    .then((data) => {
      // Extract relevant weather information from the data
      const cityName = data.name;
      const temperature = Math.round(data.main.temp);
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const weatherIcon = data.weather[0].icon;

      // Display the current weather on the page
      displayCurrentWeather(cityName, temperature, humidity, windSpeed, weatherIcon);
    });
}

// Function to display the current weather on the page
function displayCurrentWeather(cityName, temperature, humidity, windSpeed, weatherIcon) {
  $("#city-name-display").text(cityName);
  $("#temperature").text(temperature);
  $("#humidity").text(humidity);
  $("#wind-speed").text(windSpeed);
  const iconTemplate = `<img src="http://openweathermap.org/img/wn/${weatherIcon}.png" alt="weather-icon" id="current-weather-icon">`;
  $("#weather-icon").html(iconTemplate);
}

// Function to fetch geolocation data for a given city
function searchCityGeo(city) {
  const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${WEATHER_API_KEY}`;

  // Fetch geolocation data from the API
  fetch(geoURL)
    .then((response) => response.json())
    .then((data) => {
      // Extract latitude and longitude from the data
      const { lat, lon } = data[0];

      // Display the five-day forecast using the geolocation data
      displayFiveDayForecast(lat.toFixed(2), lon.toFixed(2));
    });
}

// Function to display the five-day forecast on the page
function displayFiveDayForecast(lat, lon) {
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${WEATHER_API_KEY}`;

  // Fetch forecast data from the API
  fetch(forecastURL)
    .then((response) => response.json())
    .then((data) => {
      // Clear the forecast container
      const forecastContainer = document.getElementById("forecast");
      forecastContainer.innerHTML = "";

      // Iterate over the forecast data for every 8th entry (one entry per day)
      for (let i = 0; i < data.list.length; i += 8) {
        const forecastItem = data.list[i];
        const date = forecastItem.dt_txt.substring(0, 10);
        const temperature = Math.round(forecastItem.main.temp);
        const humidity = forecastItem.main.humidity;
        const windSpeed = forecastItem.wind.speed;
        const weatherIcon = forecastItem.weather[0].icon;

        // Create a template for each forecast item
        const template = `
          <ul class="forecast-five-day">
            <li><span class="fs-5 text">${date}</span></li>
            <img src="http://openweathermap.org/img/wn/${weatherIcon}.png" alt="weather-icon" id="forecast-weather-icon">
            <li> Temp: <span class="fs-5 text">${temperature}&#176;F</span></li>
            <li> Wind: <span class="fs-5 text">${windSpeed} MPH</span></li>
            <li> Humidity: <span class="fs-5 text">${humidity}%</span></li>
          </ul>
        `;

        // Append the forecast item template to the forecast container
        forecastContainer.innerHTML += template;
      }
    });
}

// Function to save a recent search
function saveRecentSearch(city) {
  // Convert the city to title case
  const searchedCity = toTitleCase(city);

  // Add the city to the array if it's not already present
  if (!cityArrList.includes(searchedCity)) {
    cityArrList.push(searchedCity);

    // Remove the oldest search if the array length exceeds 8
    if (cityArrList.length > 8) {
      cityArrList.shift();
    }

    // Rebuild the search buttons
    buildSearchButtons();
  }

  // Store the updated city array in local storage
  localStorage.setItem("cities", JSON.stringify(cityArrList));
}

// Function to convert a string to title case
function toTitleCase(city) {
  const cityArr = city.toLowerCase().split(" ");

  for (let i = 0; i < cityArr.length; i++) {
    cityArr[i] = cityArr[i][0].toUpperCase() + cityArr[i].slice(1);
  }

  return cityArr.join(" ");
}

// Function to build the search buttons for recent cities
function buildSearchButtons() {
  // Clear the recent search container
  recentSearch.innerHTML = "";

  // Iterate over the city array and create a button for each city
  for (let i = 0; i < cityArrList.length; i++) {
    const buttonEl = document.createElement("button");
    buttonEl.textContent = cityArrList[i];
    buttonEl.setAttribute("class", "searched-city-btn btn btn-secondary my-1");
    recentSearch.appendChild(buttonEl);

    // Add click event listener to each button
    buttonEl.addEventListener("click", () => {
      const buttonText = buttonEl.textContent;
      searchCityWeather(buttonText);
      searchCityGeo(buttonText);
      saveRecentSearch(buttonText);
    });
  }
}

// Function to display the current date and time
function displayTime() {
  $("#current-date").text(dayjs().format("MMM D, YYYY"));
  $("#current-time").text(dayjs().format("h:mm:ss A"));
}

// Update the current date and time every second
setInterval(displayTime, 1000);

// Build the initial search buttons and perform weather and geolocation search for the default city
buildSearchButtons();
searchCityWeather(city);
searchCityGeo(city);
