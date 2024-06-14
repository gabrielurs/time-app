import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState("");
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
        if(hoursTmp == null){
             data = weather[daysTmp];
        }else{
             data = weather[daysTmp][hoursTmp];
        }


        let cloudCover = data['cloudcover'];
        let precipitationRate = data['prec_amount'];
        let precipitationType = data['prec_type'];
        let relativeHumidity = data['rh2m'];
        let liftedIndex = data['lifted_index'];
        var generalWeather = '';
    
        cloudCover = parseInt(cloudCover.split('%')[0].trim()); 
        precipitationRate = parseInt(precipitationRate);
        relativeHumidity = parseInt(relativeHumidity);
        liftedIndex = parseInt(liftedIndex.split(' ')[0].trim()); 
    
        // Total cloud cover less than 20% = Clear
        if (cloudCover <= 20) {
            generalWeather = "Clear";
        }
    
        // Total cloud cover between 20%-60% = Cloudy
        if (cloudCover > 20 && cloudCover <= 60) {
            generalWeather = "Cloudy";
        }

        //cloud cover over 80% 
        if(cloudCover >= 80){
            generalWeather = "Very Cloudy";
        }
    
        // Relative humidity over 90% with total cloud cover less than 60% = Foggy
        if (relativeHumidity > 90 && cloudCover <= 60) {
            generalWeather = "Foggy";
        }
    
        // Precipitation rate less than 4mm/hr with cloud cover more than 80% = Light rain or showers
        if (precipitationRate < 4 && cloudCover > 80 && precipitationType == 'rain') {
            generalWeather = "Light rain or showers";
        }
    
        // Precipitation rate less than 4mm/hr with cloud cover between 60%-80% = Occasional Showers
        if (precipitationRate < 4 && cloudCover > 60 && cloudCover <= 80 && precipitationType == 'rain') {
            generalWeather = "Occasional Showers";
        }
    
        // Precipitation rate less than 4mm/hr less than 60% = Isolated Showers
        if (precipitationRate < 4 && cloudCover <= 60 && precipitationType == 'rain') {
            generalWeather = "Isolated Showers";
        }
    
        // Precipitation rate over 4mm/hr = Rain
        if (precipitationRate >= 4 && precipitationType == 'rain') {
            generalWeather = "Rain";
        }
    
        // Precipitation rate over 4mm/hr = Snow
        if (precipitationRate >= 4 && precipitationType == 'snow') {
            generalWeather = "Snow";
        }
    
        // Precipitation type to be ice pellets or freezing rain = Mixed
        if (precipitationType == 'icep' || precipitationType == 'frzr') {
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
        if (liftedIndex < -5 && precipitationType == 'rain') {
            generalWeather = "Thunderstorm with rain";
        }
    
        return generalWeather;
    }
    

    const determineWeather = (weather) => {
        var daysTmp = Object.keys(weather);
        let hoursTmp = Object.keys(weather[daysTmp[0]]);
        let generalWeatherTmp = [];
        let weatherTmp = [];

        generalWeatherTmp[0] = conditionalWeather(weather, daysTmp[0], hoursTmp);
        generalWeatherTmp[1] = conditionalWeather(weather, daysTmp[1], null)
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
            console.log(translateWeatherResponse.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="antialiased min-h-screen bg-gray-100 flex items-center">
            <div className="w-full max-w-sm mx-auto">
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
                                    {weather[days[0]]?.[hour]['temp2m'] + '°C'}
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
                                <div className="font-semibold"> {weather[days[1]]?.['temp2m'] + '°C'}</div>
                            </div>
                            <div className="flex-1 text-center pt-4 px-5">
                                <div className="">{days[2]}</div>
                                <div className="">icon</div>
                                <div className="font-semibold"> {weather[days[1]]?.['temp2m'] + '°C'}</div>

                            </div>
                        </div>
                    </div>
                </div>
                {/* First Row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">Cloud Cover</h1>
                        <p>icon</p>
                        <h2 className="font-bold">{weather[days[0]]?.[hour]['cloudcover']}</h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">Atm Seeing</h1>
                        <p>icon</p>
                        <h2 className="font-bold">{weather[days[0]]?.[hour]['seeing']}</h2>
                    </div>
                </div>
                {/* Second Row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">Transparency</h1>
                        <p>icon</p>
                        <h2 className="font-bold">{weather[days[0]]?.[hour]['transparency']}</h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">Atm Instability</h1>
                        <p>icon</p>
                        <h2 className="font-bold">{weather[days[0]]?.[hour]['lifted_index']}</h2>
                    </div>
                </div>

                {/* Third row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">Wind Speed</h1>
                        <p>icon</p>
                        <h2 className="font-bold">{weather[days[0]]?.[hour]['wind10m_speed']}</h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">Wind Direction</h1>
                        <p>icon</p>
                        <h2 className="font-bold">{weather[days[0]]?.[hour]['wind10m_direction']}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
