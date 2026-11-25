
const USERS_KEY = "skycastUsers";
const SESSION_KEY = "skycastCurrentUser";

function createAdmin() {
  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const adminExists = users.some(user => user.email === "admin@gmail.com");

  if (!adminExists) {
    users.push({
      name: "Administrator",
      email: "admin@gmail.com",
      password: "admin123",
      role: "admin"
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

createAdmin();

function showSignup() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.remove("hidden");
}

function showLogin() {
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("loginForm").classList.remove("hidden");
}

function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const message = document.getElementById("signupMessage");

  message.textContent = "";
  message.className = "message";

  if (!name || !email || !password) {
    showMessage(message, "Please fill all fields.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage(message, "Password must be at least 6 characters.", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const exists = users.some(user => user.email === email);

  if (exists) {
    showMessage(message, "This email is already registered.", "error");
    return;
  }

  const newUser = {
    name: name,
    email: email,
    password: password,
    role: "user"
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  showMessage(message, "Account created successfully!", "success");

  setTimeout(() => {
    showLogin();
    document.getElementById("loginEmail").value = email;
    document.getElementById("loginPassword").value = "";
  }, 800);
}

function login() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const message = document.getElementById("loginMessage");

  message.textContent = "";
  message.className = "message";

  if (!email || !password) {
    showMessage(message, "Enter email and password.", "error");
    return;
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    showMessage(message, "Invalid email or password.", "error");
    return;
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  openApp(user);
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = "message " + type;
}

function openApp(user) {
  document.getElementById("authPage").classList.add("hidden");
  document.getElementById("weatherPage").classList.add("hidden");
  document.getElementById("adminPage").classList.add("hidden");

  if (user.role === "admin") {
    document.getElementById("adminPage").classList.remove("hidden");
    loadAdminDashboard();
  } else {
    document.getElementById("weatherPage").classList.remove("hidden");

    document.getElementById("userName").textContent = user.name;
    document.getElementById("welcomeName").textContent = user.name.split(" ")[0];
    document.getElementById("userAvatar").textContent =
      user.name.charAt(0).toUpperCase();

    setTodayDate();

    if (!document.getElementById("cityInput").value.trim()) {
      document.getElementById("cityInput").value = "Vijayawada";
    }

    searchWeather();
  }
}

function logout() {
  localStorage.removeItem(SESSION_KEY);

  document.getElementById("weatherPage").classList.add("hidden");
  document.getElementById("adminPage").classList.add("hidden");
  document.getElementById("authPage").classList.remove("hidden");

  document.getElementById("loginPassword").value = "";
  document.getElementById("loginMessage").textContent = "";

  showLogin();
}

function setTodayDate() {
  const now = new Date();

  document.getElementById("todayDate").textContent =
    now.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });

  document.getElementById("heroDate").textContent =
    now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short"
    });
}

function getWeatherInfo(code) {
  if (code === 0) return { icon: "☀️", text: "Clear Sky" };
  if (code === 1) return { icon: "🌤️", text: "Mainly Clear" };
  if (code === 2) return { icon: "⛅", text: "Partly Cloudy" };
  if (code === 3) return { icon: "☁️", text: "Overcast" };

  if (code === 45 || code === 48)
    return { icon: "🌫️", text: "Foggy" };

  if (code >= 51 && code <= 57)
    return { icon: "🌦️", text: "Drizzle" };

  if (code >= 61 && code <= 67)
    return { icon: "🌧️", text: "Rain" };

  if (code >= 71 && code <= 77)
    return { icon: "❄️", text: "Snow" };

  if (code >= 80 && code <= 82)
    return { icon: "🌧️", text: "Rain Showers" };

  if (code >= 85 && code <= 86)
    return { icon: "🌨️", text: "Snow Showers" };

  if (code >= 95)
    return { icon: "⛈️", text: "Thunderstorm" };

  return { icon: "🌤️", text: "Weather" };
}

function setWeatherBackground(code, isDay) {
  document.body.classList.remove(
    "weather-sunny",
    "weather-cloudy",
    "weather-rain",
    "weather-storm",
    "weather-snow",
    "weather-fog",
    "weather-night"
  );

  let background = "weather-cloudy";

  if (code === 0 || code === 1) {
    background = isDay ? "weather-sunny" : "weather-night";
  } else if (code === 2 || code === 3) {
    background = isDay ? "weather-cloudy" : "weather-night";
  } else if (code === 45 || code === 48) {
    background = "weather-fog";
  } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
    background = "weather-rain";
  } else if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    background = "weather-snow";
  } else if (code >= 95) {
    background = "weather-storm";
  }

  document.body.classList.add(background);
}

async function searchWeather() {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();
  const message = document.getElementById("weatherMessage");

  message.textContent = "";

  if (!city) {
    message.textContent = "Please enter a city name.";
    return;
  }

  document.getElementById("cityName").textContent = "Searching...";
  document.getElementById("weatherCondition").textContent = "Loading weather data";
  document.getElementById("weatherIcon").textContent = "🌍";
  document.getElementById("temperature").textContent = "--";

  document.getElementById("hourlyForecast").innerHTML =
    '<div class="loading-state">Loading forecast...</div>';

  document.getElementById("dailyForecast").innerHTML =
    '<div class="loading-state">Loading forecast...</div>';

  try {
    const geoURL =
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoURL);

    if (!geoResponse.ok) {
      throw new Error("Could not search for city.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found. Please try another city.");
    }

    const place = geoData.results[0];
    const latitude = place.latitude;
    const longitude = place.longitude;

    const weatherURL =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,cloud_cover,weather_code,is_day` +
      `&hourly=temperature_2m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` +
      `&timezone=auto&forecast_days=7`;

    const weatherResponse = await fetch(weatherURL);

    if (!weatherResponse.ok) {
      throw new Error("Unable to retrieve weather information.");
    }

    const weatherData = await weatherResponse.json();

    displayCurrentWeather(place, weatherData);
    displayHourly(weatherData);
    displayDaily(weatherData);

  } catch (error) {
    document.getElementById("cityName").textContent = "Weather unavailable";
    document.getElementById("weatherCondition").textContent = "Please try again";
    document.getElementById("weatherIcon").textContent = "⚠️";
    document.getElementById("temperature").textContent = "--";

    document.getElementById("hourlyForecast").innerHTML =
      '<div class="loading-state">Forecast unavailable</div>';

    document.getElementById("dailyForecast").innerHTML =
      '<div class="loading-state">Forecast unavailable</div>';

    message.textContent = error.message;
  }
}

function displayCurrentWeather(place, data) {
  const current = data.current;
  const info = getWeatherInfo(current.weather_code);

  setWeatherBackground(current.weather_code, current.is_day);

  document.getElementById("cityName").textContent =
    `${place.name}, ${place.country || ""}`;

  document.getElementById("weatherCondition").textContent = info.text;
  document.getElementById("weatherIcon").textContent = info.icon;

  document.getElementById("temperature").textContent =
    Math.round(current.temperature_2m);

  document.getElementById("feelsLike").textContent =
    Math.round(current.apparent_temperature);

  document.getElementById("feelsDetail").textContent =
    Math.round(current.apparent_temperature) + "°C";

  document.getElementById("humidity").textContent =
    current.relative_humidity_2m + "%";

  document.getElementById("wind").textContent =
    current.wind_speed_10m + " km/h";

  document.getElementById("clouds").textContent =
    current.cloud_cover + "%";

  document.getElementById("sunrise").textContent =
    formatTime(data.daily.sunrise[0]);

  document.getElementById("sunset").textContent =
    formatTime(data.daily.sunset[0]);
}

function formatTime(time) {
  if (!time) return "--:--";
  return time.split("T")[1] || time;
}

function displayHourly(data) {
  const container = document.getElementById("hourlyForecast");
  const hourly = data.hourly;
  const currentTime = data.current.time;

  let startIndex = hourly.time.findIndex(time => time >= currentTime);

  if (startIndex === -1) {
    startIndex = 0;
  }

  const items = [];

  for (let i = startIndex; i < startIndex + 8; i++) {
    if (i >= hourly.time.length) break;

    const info = getWeatherInfo(hourly.weather_code[i]);

    const hourLabel = i === startIndex
      ? "Now"
      : new Date(hourly.time[i]).toLocaleTimeString("en-IN", {
          hour: "numeric",
          hour12: true
        });

    items.push(`
      <div class="hour-item">
        <small>${hourLabel}</small>
        <div class="forecast-icon">${info.icon}</div>
        <strong>${Math.round(hourly.temperature_2m[i])}°</strong>
      </div>
    `);
  }

  container.innerHTML = items.join("");
}

function displayDaily(data) {
  const container = document.getElementById("dailyForecast");
  const daily = data.daily;
  const days = [];

  for (let i = 0; i < daily.time.length; i++) {
    const date = new Date(daily.time[i] + "T12:00:00");

    const dayName = i === 0
      ? "Today"
      : date.toLocaleDateString("en-IN", { weekday: "long" });

    const info = getWeatherInfo(daily.weather_code[i]);

    days.push(`
      <div class="day-item">
        <div class="day-name">${dayName}</div>

        <div class="day-weather">
          <span>${info.icon}</span>
          <strong>${info.text}</strong>
        </div>

        <small>Sunrise ${formatTime(daily.sunrise[i])}</small>

        <div class="day-temp">
          <strong>${Math.round(daily.temperature_2m_max[i])}°</strong>
          <span>${Math.round(daily.temperature_2m_min[i])}°</span>
        </div>
      </div>
    `);
  }

  container.innerHTML = days.join("");
}

function loadAdminDashboard() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const regularUsers = users.filter(user => user.role === "user");
  const adminUsers = users.filter(user => user.role === "admin");

  document.getElementById("totalUsers").textContent = users.length;
  document.getElementById("regularUsers").textContent = regularUsers.length;
  document.getElementById("adminUsers").textContent = adminUsers.length;

  renderUsers(users);
}

function renderUsers(users) {
  const table = document.getElementById("usersTable");

  if (users.length === 0) {
    table.innerHTML = `
      <tr>
        <td colspan="3" class="empty-table">No users found.</td>
      </tr>
    `;
    return;
  }

  table.innerHTML = users.map(user => `
    <tr>
      <td>${escapeHTML(user.name)}</td>
      <td>${escapeHTML(user.email)}</td>
      <td>
        <span class="role-badge ${user.role === "admin" ? "admin" : ""}">
          ${escapeHTML(user.role)}
        </span>
      </td>
    </tr>
  `).join("");
}

function filterUsers() {
  const query = document.getElementById("userSearch").value.toLowerCase();
  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  );

  renderUsers(filteredUsers);
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

document.getElementById("cityInput").addEventListener("keydown", event => {
  if (event.key === "Enter") searchWeather();
});

document.getElementById("loginPassword").addEventListener("keydown", event => {
  if (event.key === "Enter") login();
});

document.getElementById("loginEmail").addEventListener("keydown", event => {
  if (event.key === "Enter") login();
});

window.onload = function() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY));

  if (session) {
    openApp(session);
  } else {
    document.getElementById("authPage").classList.remove("hidden");
    showLogin();
  }
};
