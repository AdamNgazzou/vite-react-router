import React, { useEffect, useRef, useState } from 'react';
import './Weather.css';
import search_icon from '../assets/search.png';
import clear_icon from '../assets/clear.png';
import cloud_icon from '../assets/cloud.png';
import drizzle_icon from '../assets/drizzle.png';
import humidity_icon from '../assets/humidity.png';
import rain_icon from '../assets/rain.png';
import snow_icon from '../assets/snow.png';
import wind_icon from '../assets/wind.png';

const Weather = () => {
  const inputRef = useRef();
  const [isSearching, setIsSearching] = useState(false);
  const [weatherData, setWeatherData] = useState(false);
  const [gradientAngle, setGradientAngle] = useState(180); // Start with 180 degrees

  const allIcons = {
    '01d': clear_icon,
    '01n': clear_icon,
    '02d': cloud_icon,
    '02n': cloud_icon,
    '03d': cloud_icon,
    '03n': cloud_icon,
    '04d': drizzle_icon,
    '04n': drizzle_icon,
    '09d': rain_icon,
    '09n': rain_icon,
    '10d': rain_icon,
    '10n': rain_icon,
    '13d': snow_icon,
    '13n': snow_icon,
  };

  const calculateGradientAngle = (timezoneOffset) => {
    const currentDate = new Date();
    const localTime = new Date(currentDate.getTime() + timezoneOffset * 1000);
    const localHour = localTime.getHours();

    let angle;

    if (localHour >= 12 && localHour < 24) {
      // From 12 PM to 12 AM
      angle = (localHour - 12) * 15; // 0 degrees at 12 PM to 180 degrees at 12 AM
    } else {
      // From 12 AM to 12 PM
      angle = 180 + localHour * 15; // 180 degrees at 12 AM to 360 degrees (or 0 degrees) at 12 PM
    }

    console.log(angle);

    setGradientAngle(angle);
  };

  const search = async (city, forceRefresh = false) => {
    if (city === '' && !forceRefresh) {
      alert('Enter City Name');
      return false;
    }
    setIsSearching(true);
    try {
      const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${import.meta.env.VITE_APP_ID}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        alert(data.message);
        return false;
      }

      const icon = allIcons[data.list[0].weather[0].icon] || clear_icon;
      setWeatherData({
        humidity: data.list[0].main.humidity,
        windSpeed: data.list[0].wind.speed,
        temperature: Math.floor(data.list[0].main.temp),
        location: data.city.name,
        icon: icon,
      });

      // Calculate gradient angle based on the city's timezone
      calculateGradientAngle(data.city.timezone);
    } catch (error) {
      setWeatherData(false);
      console.error('Error in fetching weather data');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    search('Sousse'); // Default search
  }, []);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        search(inputRef.current.value);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div
      className='weather'
      style={{
        backgroundImage: `linear-gradient(${gradientAngle}deg, #000000, #134980, #f18719)`, // Apply dynamic gradient
      }}
    >
      <div className='search-bar'>
        <input
          ref={inputRef}
          type='text'
          placeholder='Search city name'
          onKeyDown={(e) => e.key === 'Enter' && search(e.target.value)}
        />
        <img src={search_icon} alt='' onClick={() => search(inputRef.current.value)} />
      </div>
      {weatherData ? (
        <>
          <img src={weatherData.icon} alt='' className='weather-icon' />
          <p className='temperature'>{weatherData.temperature}°c</p>
          <p className='location'>{weatherData.location}</p>
          <div className='weather-data'>
            <div className='col'>
              <img src={humidity_icon} alt='' />
              <div>
                <p>{weatherData.humidity}%</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className='col' id='wind'>
              <img src={wind_icon} alt='' />
              <div>
                <p>{weatherData.windSpeed} Km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Please enter a city name</p>
      )}
    </div>
  );
};

export default Weather;
