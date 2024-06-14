import React, { useEffect, useState } from "react";
import axios from "axios";
import "./css/animation.css";

const Home = () => {
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState([]);
    const [generalWeather, setGeneralWeather] = useState([]);
    const [days, setDays] = useState([]);
    const [hour, setHour] = useState("");

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const formattedDate = today.toLocaleDateString("en-US", options);

    function conditionalWeather(weather, daysTmp, hoursTmp) {
        let data = [];
        if (hoursTmp == null) {
            data = weather[daysTmp];
        } else {
            data = weather[daysTmp][hoursTmp];
        }

        let cloudCover = data["cloudcover"];
        let precipitationRate = data["prec_amount"];
        let precipitationType = data["prec_type"];
        let relativeHumidity = data["rh2m"];
        let liftedIndex = data["lifted_index"];
        var generalWeather = "";

        cloudCover = parseInt(cloudCover.split("%")[0].trim());
        precipitationRate = parseInt(precipitationRate);
        relativeHumidity = parseInt(relativeHumidity);
        liftedIndex = parseInt(liftedIndex.split(" ")[0].trim());

        // Total cloud cover less than 20% = Clear
        if (cloudCover <= 20) {
            generalWeather = "Clear";
        }

        // Total cloud cover between 20%-60% = Cloudy
        if (cloudCover > 20 && cloudCover <= 60) {
            generalWeather = "Cloudy";
        }

        //cloud cover over 80%
        if (cloudCover >= 80) {
            generalWeather = "Very Cloudy";
        }

        // Relative humidity over 90% with total cloud cover less than 60% = Foggy
        if (relativeHumidity > 90 && cloudCover <= 60) {
            generalWeather = "Foggy";
        }

        // Precipitation rate less than 4mm/hr with cloud cover more than 80% = Light rain or showers
        if (
            precipitationRate < 4 &&
            cloudCover > 80 &&
            precipitationType == "rain"
        ) {
            generalWeather = "Light rain or showers";
        }

        // Precipitation rate less than 4mm/hr with cloud cover between 60%-80% = Occasional Showers
        if (
            precipitationRate < 4 &&
            cloudCover > 60 &&
            cloudCover <= 80 &&
            precipitationType == "rain"
        ) {
            generalWeather = "Occasional Showers";
        }

        // Precipitation rate less than 4mm/hr less than 60% = Isolated Showers
        if (
            precipitationRate < 4 &&
            cloudCover <= 60 &&
            precipitationType == "rain"
        ) {
            generalWeather = "Isolated Showers";
        }

        // Precipitation rate over 4mm/hr = Rain
        if (precipitationRate >= 4 && precipitationType == "rain") {
            generalWeather = "Rain";
        }

        // Precipitation rate over 4mm/hr = Snow
        if (precipitationRate >= 4 && precipitationType == "snow") {
            generalWeather = "Snow";
        }

        // Precipitation type to be ice pellets or freezing rain = Mixed
        if (precipitationType == "icep" || precipitationType == "frzr") {
            generalWeather = "Mixed";
        }

        // Lifted Index less than -5 with precipitation rate below 4mm/hr = Thunderstorm possible
        if (liftedIndex < -5 && precipitationRate < 4) {
            generalWeather = "Thunderstorm possible";
        }

        // Lifted Index less than -5 with precipitation rate over 4mm/hr = Thunderstorm
        if (liftedIndex < -5 && precipitationRate >= 4) {
            generalWeather = "Thunderstorm";
        }

        // Lifted index less than -5 with precipitation type rain = Thunderstorm with rain
        if (liftedIndex < -5 && precipitationType == "rain") {
            generalWeather = "Thunderstorm with rain";
        }

        return generalWeather;
    }

    const determineWeather = (weather) => {
        var daysTmp = Object.keys(weather);
        let hoursTmp = Object.keys(weather[daysTmp[0]]);
        let generalWeatherTmp = [];
        let weatherTmp = [];

        generalWeatherTmp[0] = conditionalWeather(
            weather,
            daysTmp[0],
            hoursTmp
        );
        generalWeatherTmp[1] = conditionalWeather(weather, daysTmp[1], null);
        generalWeatherTmp[2] = conditionalWeather(weather, daysTmp[2], null);

        setDays(daysTmp);
        setHour(hoursTmp[0]);
        setGeneralWeather(generalWeatherTmp);
        setWeather(weather);
    };

    const fetchData = async () => {
        try {
            const mapResponse = await axios.get(
                `${import.meta.env.VITE_API_URL}/map`
            );
            if (!mapResponse.data) throw new Error("Map is empty");
            const mapData = await mapResponse.data;
            setCity(mapData.city);
            setCountry(mapData.country);

            const cityResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/city`,
                { city: mapData.city }
            );
            if (!cityResponse.data) throw new Error("City data is empty");
            const cityData = await cityResponse.data;

            const astroResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/astro`,
                {
                    lat: cityData.lat,
                    lng: cityData.lng,
                }
            );

            if (!astroResponse.data) throw new Error("Astro data is empty");
            const astroData = await astroResponse.data;

            const astroTranslationResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/translate_astro`,
                { astro: astroData }
            );
            if (!astroTranslationResponse.data)
                throw new Error("Astro data is empty");
            const astroTranslated = await astroTranslationResponse.data;

            const meteoResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/meteo`,
                {
                    lat: cityData.lat,
                    lng: cityData.lng,
                }
            );
            if (!meteoResponse.data) throw new Error("Meteo data is empty");
            const meteoData = await meteoResponse.data;

            const meteoTranslatedResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/translate_meteo`,
                { meteo: meteoData }
            );
            if (!meteoTranslatedResponse.data)
                throw new Error("Meteo data is empty");
            const meteoTranslated = await meteoTranslatedResponse.data;

            const translateWeatherResponse = await axios.post(
                `${import.meta.env.VITE_API_URL}/merge_translations`,
                {
                    astro: astroTranslated,
                    meteo: meteoTranslated,
                }
            );

            if (!translateWeatherResponse.data)
                throw new Error("Weather data is empty");
            determineWeather(translateWeatherResponse.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer = setTimeout(() => {
            setLoading(true);
        }, 2000);

        fetchData();

        return () => {
            clearTimeout(timer);
        };
    }, []);

    return loading ? (
        <div className="center-container">
            <div className="loader"></div>
        </div>
    ) : (
        <div className="antialiased min-h-screen bg-gray-100 flex items-center">
            <div className="w-full max-w-sm mx-auto mt-5 mb-5 min-[412px]:m-5 min-[375px]:m-5 min-[360px]:m-5">
                {/* Search Bar */}
                <form className="flex items-center mb-2">
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="bg-white border text-black text-sm rounded-lg block w-full p-2.5"
                            placeholder="Search city"
                        />
                    </div>
                    <button
                        type="submit"
                        className="inline-flex items-center py-2.5 px-3 ml-2 text-sm font-medium text-white bg-black rounded-lg border hover:bg-white hover:text-black"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                        </svg>
                    </button>
                </form>
                {/* Weather Card */}
                <div className="bg-white shadow rounded-lg p-5 w-full border-solid">
                    <h2 className="font-bold text-gray-800 text-lg">
                        {formattedDate}
                    </h2>
                    <div>
                        <div className="flex mt-4 mb-2">
                            <div className="flex-1">
                                <div className="text-gray-600 text-sm">
                                    {city}, {country}
                                </div>
                                <div className="text-3xl font-bold text-gray-800">
                                    {weather[days[0]]?.[hour]["temp2m"] + "°C"}
                                </div>
                                <div className="text-xs text-gray-600 font-semibold">
                                    {generalWeather[0]}
                                </div>
                            </div>
                            <div className="w-24">
                                <img loading="lazy" />
                            </div>
                        </div>
                        <div className="flex space-x-2 justify-between border-t dark:border-gray-500">
                            <div className="flex-1 text-center pt-4 border-r px-5 dark:border-gray-500">
                                <div className="">{days[1]}</div>
                                <div className="">icon</div>
                                <div className="font-semibold">
                                    {" "}
                                    {weather[days[1]]?.["temp2m"] + "°C"}
                                </div>
                            </div>
                            <div className="flex-1 text-center pt-4 px-5">
                                <div className="">{days[2]}</div>
                                <div className="">icon</div>
                                <div className="font-semibold">
                                    {" "}
                                    {weather[days[1]]?.["temp2m"] + "°C"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* First Row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">Cloud Cover</h1>
                        <svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><path d="M284.67,123.72a37.89,37.89,0,0,0-35.94,50,40.74,40.74,0,0,0-31.57,4.92c-4-23.46-25.5-41-50.67-39.63-24,1.18-42.94,18.72-46,41.21a39.39,39.39,0,0,0-13.33-2.33,41.28,41.28,0,0,0-41.23,41.22c0,.49,0,1,.07,1.5-11.52,3.13-28,9.79-28,33.33,0,17.08,13.89,31.76,33,33.32v.13l.49-.08c.3,0,.59.07.89.08l.13-.2c5.51-.54,25.28-1,43.8,14.25,12.57,10.36,27,13.15,41,14.37,3,.26,5.84.39,8.6.39,13.46,0,24.2-3.07,30.12-8.74,16.86-16.1,36.44-9.88,53.69-4.4,13.93,4.4,28.31,9,33.43-5.6a21.34,21.34,0,0,0,.63-12.91c13-6.39,22.32-20.67,21.54-36.08-.71-14.56-10.87-26.82-25.3-31.17.1-1.21.16-2.41.16-3.62a41.08,41.08,0,0,0-2.81-14.83,38,38,0,1,0,7.42-75.17Zm-14.2,90a32.1,32.1,0,0,1-.64,6.32l-1,4.83,4.84.84c12.35,2.17,21.37,11.74,21.94,23.27.54,10.74-6.34,22.75-17,27.49a14.61,14.61,0,0,0-15.29-3c-5.42,2.26-8.58,6.75-8.43,12,.11,4.4,2.52,8.31,5.85,9.51a6.3,6.3,0,0,0,7-2.08L262.9,289c-.44-.14-1.53-1.54-1.61-3.58-.08-1.86.65-4.4,4.51-6a8.33,8.33,0,0,1,8.78,2c3.45,3.24,4.35,8.47,2.42,14-2.8,8-9.2,6.77-25.47,1.62-17.07-5.43-40.45-12.84-60,5.89-5.73,5.48-18.32,8-33.75,6.59-12.89-1.13-26.33-3.47-37.37-12.87-14.25-12.13-28.15-15.25-37.58-15.67a47.44,47.44,0,0,1,33.08,3.92c15.5,7.85,34.18,15.25,49.62,15.25,8.76,0,16.48-2.38,21.95-8.43,12.09-13.33,26.57-11.84,39.29-10.55,11.36,1.18,23.1,2.36,27.12-10.44,2.18-6.95.64-13.47-4.18-17.88-5.05-4.6-13-6.11-19-3.6-6.79,2.84-7.42,7.48-7.36,9.34a10,10,0,0,0,6.72,8.81,7.79,7.79,0,0,0,8.81-2.19L234,261c-.2.23-.65.76-1.83.35a3.74,3.74,0,0,1-2.48-3c-.05-1.65,2.39-2.83,3.45-3.28,3.72-1.55,9-.52,12.22,2.43,2.1,1.92,4.22,5.42,2.38,11.25-2.33,7.5-8.28,7.24-20.35,6-12.85-1.31-30.42-3.12-44.67,12.6-13.1,14.44-45.68,1-63.94-8.24a54.71,54.71,0,0,0-47.07-1.24,29.13,29.13,0,0,1-13-4.51c7.71-4.84,31.12-16.78,56.87-2.68,15.53,8.5,28.74,11.4,39.54,11.4,15.75,0,26.35-6.17,31.47-10.07,7.92-6,8.27-16.81,4.58-23.91C188,242,180.75,236.61,170.09,240a11.18,11.18,0,0,0-7.76,13.51c1.28,5.24,6.37,9.89,14.87,8.38l-1.1-6.29c-4.71.79-7-1.33-7.56-3.61a4.86,4.86,0,0,1,3.48-5.9c8.39-2.69,12.22,2.62,13.47,5,2.51,4.86,2.16,12.13-2.78,15.89-7.63,5.81-29.16,17.27-64.07-1.87-30.53-16.7-58.2-.59-65,4A22.46,22.46,0,0,1,47.54,254c0-15.89,8.66-21.06,24.68-25l3.62-1.37.1-3.64-.18-2a19.82,19.82,0,0,1-.27-2.81,31.66,31.66,0,0,1,31.63-31.62,31.08,31.08,0,0,1,15.34,4.15l7.29,4.08-.14-8.34c-.35-20.7,16-37.74,37.35-38.78l2.08-.07c21,0,38.14,15.88,39.15,36.18a32.17,32.17,0,0,1-.1,3.3l-.43,12.33,8.65-8.81a31.48,31.48,0,0,1,41.65-3,38.21,38.21,0,0,0,3.39,3A31.52,31.52,0,0,1,270.47,213.72Zm14.2-20.43a31.66,31.66,0,0,1-11.41-2.16,41.31,41.31,0,0,0-16.38-14.4,31.61,31.61,0,1,1,27.79,16.56Z"/><path d="M251,132a2.64,2.64,0,0,0,4-3.48L235.32,106a2.65,2.65,0,0,0-4,3.49Z"/><path d="M284.81,119a2.64,2.64,0,0,0,2.62-2.66l-.21-29.91a2.65,2.65,0,1,0-5.29,0l.21,29.91A2.65,2.65,0,0,0,284.81,119Z"/><path d="M209.2,157.26,239,159.7a2.65,2.65,0,0,0,.42-5.29L209.63,152a2.67,2.67,0,0,0-2.86,2.44A2.63,2.63,0,0,0,209.2,157.26Z"/><path d="M352.88,197.58l-26.46-13.91a2.65,2.65,0,1,0-2.47,4.68l26.46,13.93a2.65,2.65,0,0,0,2.47-4.7Z"/><path d="M359.09,147.34l-29.69,3.48a2.65,2.65,0,1,0,.61,5.26l29.71-3.47a2.65,2.65,0,0,0-.63-5.27Z"/><path d="M300.57,202.4a2.64,2.64,0,0,0-5,1.76l9.94,28.21a2.65,2.65,0,1,0,5-1.76Z"/><path d="M315.41,129.21l18.41-23.56a2.65,2.65,0,1,0-4.17-3.26L311.23,126a2.65,2.65,0,1,0,4.18,3.25Z"/></svg>
                        <h2 className="font-bold">
                            {weather[days[0]]?.[hour]["cloudcover"]}
                        </h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">Atm Seeing</h1>
                        <svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><path d="M216.6,106.85a88.59,88.59,0,0,1-20.53,158.94,91.59,91.59,0,0,1-12.15,2.91A88.58,88.58,0,1,0,216.6,106.85Z"/><polygon points="141.01 290.97 118.51 281.39 97.83 294.45 100.04 270.09 81.22 254.47 105.08 249.07 114.08 226.31 126.65 247.29 151.05 248.87 134.97 267.3 141.01 290.97"/><polygon points="127.29 179.5 109.37 171.87 92.94 182.27 94.68 162.9 79.7 150.45 98.68 146.16 105.85 128.05 115.85 144.72 135.26 145.99 122.48 160.67 127.29 179.5"/><polygon points="207.76 209.04 192.34 202.49 178.21 211.41 179.69 194.75 166.82 184.04 183.15 180.37 189.31 164.79 197.91 179.16 214.62 180.23 203.62 192.85 207.76 209.04"/></svg>
                        <h2 className="font-bold">
                            {weather[days[0]]?.[hour]["seeing"]}
                        </h2>
                    </div>
                </div>
                {/* Second Row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">
                            Transparency
                        </h1>
                        <svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><circle cx="161.56" cy="223.88" r="92.35"/><path d="M233.7,278a97.1,97.1,0,1,1,97.09-97.09A97.21,97.21,0,0,1,233.7,278Zm0-184.71a87.62,87.62,0,1,0,87.62,87.62A87.72,87.72,0,0,0,233.7,93.24Z"/><path d="M280.69,134.72c9.56,6.65,23.54,22,21.89,54.55a3.45,3.45,0,0,1-6.64,1.14C291.76,180,285,163.06,275.51,138.8A3.45,3.45,0,0,1,280.69,134.72Z"/></svg>
                        <h2 className="font-bold">
                            {weather[days[0]]?.[hour]["transparency"]}
                        </h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">
                            Instability
                        </h1>
                        <svg id="Capa_1"  data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><polygon points="167.71 359.17 168.81 356.67 207.68 269.43 169.92 269.33 202.07 194.65 205.17 194.65 183.41 259.66 223.96 259.96 167.71 359.17"/><path d="M312.46,122.23c.11-1.26.17-2.52.17-3.77a42.85,42.85,0,0,0-42.8-42.79,42.4,42.4,0,0,0-22.51,6.41c-4.16-24.36-26.49-42.6-52.63-41.17-24.88,1.24-44.58,19.45-47.82,42.78A41.51,41.51,0,0,0,133,81.3a42.87,42.87,0,0,0-42.8,42.8q0,.77.06,1.56c-12,3.26-29.11,10.16-29.08,34.62,0,18.15,15.12,33.75,35.68,34.73l6.31-9.72c-.75,0-1.59,0-2.19.07l-1.53,0c-15.59,0-28.3-11.27-28.31-25.11,0-16.54,9-21.88,25.65-26l3.74-1.42.11-3.77-.19-2a20.46,20.46,0,0,1-.27-2.94A32.86,32.86,0,0,1,133,91.26a32.17,32.17,0,0,1,16,4.33l7.56,4.22-.15-8.66C156,69.66,173.08,52,195.18,50.86l2.17,0c21.76,0,39.59,16.47,40.65,37.54,0,.76,0,1.51-.11,3.45l-.45,12.79,9-9.13a32.82,32.82,0,0,1,56.24,23A33.89,33.89,0,0,1,302,125l-1,5,5,.88c12.82,2.24,22.2,12.19,22.79,24.17s-7.68,25.7-20.26,29.65l3.32,9.28c15.87-5.29,27.77-21.69,26.88-39.42C338,139.49,327.44,126.74,312.46,122.23Z"/><path d="M129.71,298.35c0,1.2-1.37,2.16-3.07,2.16h0c-1.7,0-3.07-1-3.07-2.16V178.81c0-1.19,1.37-2.15,3.07-2.15h0c1.7,0,3.07,1,3.07,2.15Z"/><path d="M157.76,316.72c0,1.2-1.37,2.18-3.07,2.18h0c-1.7,0-3.07-1-3.07-2.18V197.19c0-1.21,1.37-2.18,3.07-2.18h0c1.7,0,3.07,1,3.07,2.18Z"/><path d="M233.61,328.13c0,1.2-1.38,2.16-3.07,2.16h0c-1.7,0-3.07-1-3.07-2.16V208.59c0-1.18,1.37-2.16,3.07-2.16h0c1.69,0,3.07,1,3.07,2.16Z"/><path d="M265.42,290.61c0,1.2-1.39,2.17-3.07,2.17h0c-1.68,0-3.06-1-3.06-2.17V171.07c0-1.17,1.38-2.15,3.06-2.15h0c1.68,0,3.07,1,3.07,2.15Z"/></svg>
                        <h2 className="font-bold">
                            {weather[days[0]]?.[hour]["lifted_index"]}
                        </h2>
                    </div>
                </div>

                {/* Third row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">Wind Speed</h1>
                        <svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><path d="M346.53,191.27c-6.24-5.87-14.94-7.7-22.27-4.65-7.72,3.21-12.24,9.62-12,17.11.14,6.27,3.59,11.84,8.33,13.54a9,9,0,0,0,10-2.94l-6.9-5.62c-.65-.21-2.19-2.21-2.31-5.13-.11-2.63,1-6.25,6.45-8.57,3.94-1.66,8.87-.53,12.5,2.87,4.91,4.65,6.21,12.1,3.44,20-4,11.36-13.11,9.64-36.3,2.31-24.33-7.73-57.67-18.31-85.56,8.38-8.16,7.81-26.1,11.37-48.1,9.41-18.38-1.61-37.55-5-53.26-18.36-16.46-14-32.58-19.54-45.27-21.47A67.48,67.48,0,0,1,115.58,205c22.12,11.21,48.74,21.78,70.74,21.78,12.49,0,23.48-3.42,31.29-12,17.23-19,37.87-16.88,56-15,16.19,1.69,32.92,3.36,38.64-14.87,3.11-9.93.92-19.2-5.95-25.49-7.19-6.56-18.59-8.71-27.11-5.13-9.69,4-10.57,10.65-10.49,13.31.14,5.45,4.08,10.58,9.56,12.57a11.23,11.23,0,0,0,12.59-3.13L284,171c-.32.34-.94,1.08-2.62.49-1.88-.66-3.5-2.59-3.54-4.22-.06-2.34,3.42-4,4.91-4.66,5.32-2.21,12.82-.74,17.43,3.46,3,2.73,6,7.73,3.41,16-3.34,10.69-11.82,10.3-29,8.54-18.31-1.85-43.36-4.46-63.67,18-18.67,20.58-65.1,1.48-91.14-11.76a76.61,76.61,0,0,0-29.54-8.27,60.52,60.52,0,0,1,29.26,6.26c18.5,9,34,11.61,46.53,11,18.28-.87,30.23-8.62,36-13.44,8.85-7.41,8.64-19.95,4-28-4.09-7-12.77-12.78-24.93-8.26a13,13,0,0,0-8.24,16.1c1.76,6,7.91,11.13,17.72,8.88l-1.62-7.22c-5.42,1.17-8.21-1.16-9-3.79a5.63,5.63,0,0,1,3.71-7c9.58-3.61,14.34,2.34,15.89,5.05,3.22,5.5,3.22,14-2.31,18.62-8.52,7.13-32.85,21.66-74.47,1.41s-76.65,9.31-77,9.62l.48.55-.48.28,4.34,7v.94c1.21-.34,34.11-5.06,64.55,20C132.5,241.32,153.11,245.25,173,247c4.22.38,8.31.54,12.25.54,19.19,0,34.49-4.35,42.95-12.45,24-22.94,51.92-14.05,76.51-6.26,19.86,6.26,40.37,12.82,47.66-8C356.32,209.52,354.16,198.43,346.53,191.27Z"/></svg>
                        <h2 className="font-bold">
                            {weather[days[0]]?.[hour]["wind10m_speed"]}
                        </h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">
                            Direction
                        </h1>
                        <svg id="Capa_1" data-name="Capa 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><polygon points="184.07 185.13 148.94 157.88 277.38 157.5 277.33 138.44 149.45 138.81 183.92 111.34 172.78 97.38 108.17 148.85 173.13 199.23 184.07 185.13"/><polygon points="227.2 200.69 216.07 214.67 250.54 242.16 122.69 241.81 122.62 260.87 251.06 261.25 215.94 288.51 226.88 302.62 291.83 252.22 227.2 200.69"/></svg>
                        <h2 className="font-bold">
                            {weather[days[0]]?.[hour]["wind10m_direction"]}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
