/**
 * Free Weather API Integration
 *
 * Uses two free, no-key APIs:
 *   1. Open-Meteo Geocoding API – converts a city name to lat/lon
 *      https://geocoding-api.open-meteo.com/v1/search
 *
 *   2. Open-Meteo Forecast API – fetches current weather for a lat/lon
 *      https://api.open-meteo.com/v1/forecast
 */

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL  = 'https://api.open-meteo.com/v1/forecast';

// WMO Weather Condition codes -> human-readable label
// https://open-meteo.com/en/docs#weathervariables
const WMO_CODES = {
  0:  '☀️ Clear sky',
  1:  '🌤️ Mainly clear',
  2:  '⛅ Partly cloudy',
  3:  '☁️ Overcast',
  45: '🌫️ Fog',
  48: '🌫️ Icy fog',
  51: '🌦️ Light drizzle',
  53: '🌦️ Moderate drizzle',
  55: '🌧️ Dense drizzle',
  61: '🌧️ Slight rain',
  63: '🌧️ Moderate rain',
  65: '🌧️ Heavy rain',
  71: '🌨️ Slight snow',
  73: '🌨️ Moderate snow',
  75: '❄️ Heavy snow',
  77: '🌨️ Snow grains',
  80: '🌦️ Slight showers',
  81: '🌧️ Moderate showers',
  82: '⛈️ Violent showers',
  85: '🌨️ Slight snow showers',
  86: '🌨️ Heavy snow showers',
  95: '⛈️ Thunderstorm',
  96: '⛈️ Thunderstorm with hail',
  99: '⛈️ Thunderstorm with heavy hail',
};

const searchBtn  = document.getElementById('search-btn');
const cityInput  = document.getElementById('city-input');
const errorMsg   = document.getElementById('error-msg');
const resultCard = document.getElementById('result-card');

searchBtn.addEventListener('click', handleSearch);
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

async function handleSearch() {
  const city = cityInput.value.trim();
  if (!city) return;

  setError('');
  resultCard.hidden = true;
  searchBtn.disabled = true;
  searchBtn.textContent = 'Loading…';

  try {
    const { lat, lon, name } = await geocodeCity(city);
    const weather = await fetchWeather(lat, lon);
    displayWeather(name, weather);
  } catch (err) {
    setError(err.message);
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Get Weather';
  }
}

/**
 * Converts a city name to coordinates using the free Open-Meteo Geocoding API.
 * @param {string} city
 * @returns {{ lat: number, lon: number, name: string }}
 */
async function geocodeCity(city) {
  const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding request failed (HTTP ${response.status})`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${city}" not found. Please check the spelling and try again.`);
  }

  const { latitude, longitude, name, country } = data.results[0];
  return { lat: latitude, lon: longitude, name: `${name}, ${country}` };
}

/**
 * Fetches current weather from the free Open-Meteo Forecast API.
 * @param {number} lat
 * @param {number} lon
 * @returns {object} current weather values
 */
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'weather_code',
      'uv_index',
    ].join(','),
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
    timezone: 'auto',
  });

  const response = await fetch(`${FORECAST_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Weather request failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  return data.current;
}

/**
 * Renders the weather data into the result card.
 * @param {string} cityName
 * @param {object} current
 */
function displayWeather(cityName, current) {
  document.getElementById('city-name').textContent   = cityName;
  document.getElementById('temperature').textContent = `${current.temperature_2m} °C`;
  document.getElementById('feels-like').textContent  = `${current.apparent_temperature} °C`;
  document.getElementById('wind-speed').textContent  = `${current.wind_speed_10m} km/h`;
  document.getElementById('humidity').textContent    = `${current.relative_humidity_2m} %`;
  document.getElementById('uv-index').textContent    = current.uv_index ?? '—';

  const conditionCode = current.weather_code;
  document.getElementById('condition').textContent =
    WMO_CODES[conditionCode] ?? `Code ${conditionCode}`;

  resultCard.hidden = false;
}

/**
 * Displays or hides the error message banner.
 * @param {string} message  Empty string hides the banner.
 */
function setError(message) {
  if (message) {
    errorMsg.textContent = message;
    errorMsg.hidden = false;
  } else {
    errorMsg.textContent = '';
    errorMsg.hidden = true;
  }
}
