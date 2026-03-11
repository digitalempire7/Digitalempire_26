# Digitalempire_26

A simple weather web app that integrates with the **Open-Meteo free API** — no API key or account required.

## Features

- 🌍 Geocoding — converts any city name to coordinates (Open-Meteo Geocoding API)
- 🌤️ Current weather — temperature, feels-like, humidity, wind speed, UV index, and weather condition
- 🆓 100% free — no API key, no rate-limit sign-up, no hidden costs

## APIs used

| API | URL | Cost |
|-----|-----|------|
| Open-Meteo Geocoding | `https://geocoding-api.open-meteo.com/v1/search` | Free, no key |
| Open-Meteo Forecast  | `https://api.open-meteo.com/v1/forecast`         | Free, no key |

## How to run

Just open **`index.html`** in any modern browser — no build step or server needed.

```
open index.html
```

Type a city name (e.g. *London*, *Tokyo*, *New York*) and click **Get Weather**.
