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

    const determineWeather = (weather) => {
        var daysTmp = Object.keys(weather);
        let hoursTmp = Object.keys(weather[daysTmp[0]]);
        let generalWeatherTmp = [];
        

        for (let i in weather) {
            if (daysTmp[0] == i) {
                let data = weather[daysTmp[0]][hoursTmp[0]];
                let cloudCover = data['cloudcover'];
                let precipitationRate = data['prec_amount'];
                let precipitationTye = data['prec_type'];
                let relativeHumidity = data['rh2m'];
                let liftedIndex = data['lifted_index'];

                //Total cloud cover less than 20% = Clear
                if(parseInt(cloudCover.substring(0, cloudCover.lenght)) <= 20){
                    generalWeatherTmp[0] = "Clear";
                }
                //Total cloud cover between 20%-60% = Cloudy
                if(parseInt(cloudCover.substring(0, cloudCover.lenght)) >= 20 && parseInt(cloudCover.substring(3, cloudCover.lenght)) >= 60){
                    generalWeatherTmp[0] = "Cloudy";
                }
                //Relative humidity over 90% with total cloud cover less than 60% = Foggy
                if(parseInt(relativeHumidity) >= 13 && parseInt(cloudCover.substring(0, cloudCover.lenght)) <= 60){
                    generalWeatherTmp[0] = "Foggy";
                }
                //Precipitation rate less than 4mm/hr with cloud cover more than 80% = Light rain or showers
                if(precipitationRate >= 3 && parseInt(cloudCover.substring(0, cloudCover.lenght)) >= 80 && precipitationTye == 'rain'){
                    generalWeatherTmp[0] = "Light rain or showers";
                }
                //Precipitation rate less than 4mm/hr with cloud cover between 60%-80% = Occasional Showers
                if(precipitationRate >= 3 && parseInt(cloudCover.substring(0, cloudCover.lenght)) >= 60 && parseInt(cloudCover.substring(0, cloudCover.lenght)) <= 80 && precipitationTye == 'rain'){
                    generalWeatherTmp[0] = "Occasional Showers";
                }
           
                //Precipitation rate less than 4mm/hr less than 60% = Isolated Showers
                if(precipitationRate >= 3 && parseInt(cloudCover.substring(0, cloudCover.lenght)) <= 60 && precipitationTye == 'rain'){
                    generalWeatherTmp[0] = "Isolated Showers";
                }

                //Precipitation rate over 4mm/hr = Rain
                if(precipitationRate >= 3 && precipitationTye == 'rain'){
                    generalWeatherTmp[0] = "Rain";
                }
             
                //Precipitation rate over 4mm/hr = Snow
                if(precipitationRate >= 3 && precipitationTye == 'snow'){
                    generalWeatherTmp[0] = "Snow";
                }

                //Precipitation type to be ice pellets or freezing rain = Mixed
                if(precipitationTye == 'icep' || precipitationTye == 'frzr'){
                    generalWeatherTmp[0] = "Mixed";
                }
             
                //Lifted Index less than -5 with precipitation rate below 4mm/hr = Thunderstorm possible
                if(parseInt(liftedIndex.substring(3, liftedIndex.lenght)) <= -5 && precipitationRate <= 3){
                    generalWeatherTmp[0] = "Thunderstorm possible";
                }

                //Lifted Index less than -5 with precipitation rate over 4mm/hr = Thunderstorm
                if(parseInt(liftedIndex.substring(3, liftedIndex.lenght)) <= -5 && precipitationRate >= 3){
                    generalWeatherTmp[0] = "Thunderstorm";
                }
                //Lifted index less than -5 with precipitation type rain Thunderstorm with rain
                if(parseInt(liftedIndex.substring(3, liftedIndex.lenght)) <= -5 && precipitationTye == 'rain'){
                    generalWeatherTmp[0] = "Thunderstorm with rain";
                }
                
            }
        }

        setDays(daysTmp);
        setHour(hoursTmp[0]);
        setGeneralWeather(generalWeatherTmp);
    };

    useEffect(() => {
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
                setWeather(translateWeatherResponse.data);
                determineWeather(translateWeatherResponse.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

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
                                    {weather[days[0]]?.[hour]['temp2m'] + "°C"}
                                </div>
                                <div className="text-xs text-gray-600 font-semibold">
                                    {generalWeather}
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
                                <div className="font-semibold"> {weather[days[0]]?.[hour]['temp2m'] + "°C"}</div>
                            </div>
                            <div className="flex-1 text-center pt-4 px-5">
                                <div className="">{days[2]}</div>
                                <div className="">icon</div>
                                <div className="font-semibold"> {weather[days[0]]?.[hour]['temp2m'] + "°C"}</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* First Row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">Forecast</h1>
                        <p>icon</p>
                        <h2>data</h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">Forecast</h1>
                        <p>icon</p>
                        <h2>data</h2>
                    </div>
                </div>
                {/* Second Row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">Forecast</h1>
                        <p>icon</p>
                        <h2>data</h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">Forecast</h1>
                        <p>icon</p>
                        <h2>data</h2>
                    </div>
                </div>

                {/* Third row */}
                <div className="flex flex-row">
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 mr-2 text-center">
                        <h1 className="font-bold text-gray-800">Forecast</h1>
                        <p>icon</p>
                        <h2>data</h2>
                    </div>
                    <div className="bg-white shadow rounded-lg p-5 w-1/2 border-solid mt-2 text-center">
                        <h1 className="font-bold text-gray-800">Forecast</h1>
                        <p>icon</p>
                        <h2>data</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
