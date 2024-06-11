import React, { useEffect, useState } from "react";
import axios from "axios";

const Home = () => {
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState("");


    const today = new Date();

    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
  
    const formattedDate = today.toLocaleDateString('en-US', options);

 


    useEffect(() => {
        const fetchData = async () => {
            try {

             const mapResponse = await axios.get(`${import.meta.env.VITE_API_URL}/map`);
             if(!mapResponse.data) throw new Error('Map is empty');
             const mapData = mapResponse.data;
             setCity(mapData.city);
             setCountry(mapData.country);


              const cityResponse = await axios.post(`${import.meta.env.VITE_API_URL}/city`, { city: mapData.city });
              if (!cityResponse.data) throw new Error('City data is empty');
             const cityData = cityResponse.data;

              const astroResponse = await axios.post(`${import.meta.env.VITE_API_URL}/astro`, {
                lat: cityData.lat,
                lng: cityData.lng
              });
              if (!astroResponse.data) throw new Error('Astro data is empty');
              const astroData = astroResponse.data;


              const meteoResponse = await axios.post(`${import.meta.env.VITE_API_URL}/meteo`, {
                lat: cityData.lat,
                lng: cityData.lng
              });
              const meteoData = meteoResponse.data;
              
               const astroTranslationResponse = await axios.post(`${import.meta.env.VITE_API_URL}/translate_astro`, { astro: astroData });
               if (!astroTranslationResponse.data) throw new Error('Astro data is empty');
              

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
                    <h2 className="font-bold text-gray-800 text-lg">{formattedDate}</h2>

                    <div>
                        <div className="flex mt-4 mb-2">
                            <div className="flex-1">
                                <div className="text-gray-600 text-sm">
                                   {city}, {country}
                                </div>
                                <div className="text-3xl font-bold text-gray-800">
                                    Temperature
                                </div>
                                <div className="text-xs text-gray-600">
                                    Data condition
                                </div>
                            </div>
                            <div className="w-24">
                                <img loading="lazy" />
                            </div>
                        </div>

                        <div className="flex space-x-2 justify-between border-t dark:border-gray-500">
                            <div className="flex-1 text-center pt-4 border-r px-5 dark:border-gray-500">
                                <div className="">date</div>
                                <div className="">icon</div>
                                <div className="">Temperature</div>
                            </div>
                            <div className="flex-1 text-center pt-4 px-5">
                                <div className="">date</div>
                                <div className="">icon</div>
                                <div className="">Temperature</div>
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
