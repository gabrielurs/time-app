import React from "react";
import { Link } from "react-router-dom";
import './css/404.css';

const ErrorPage = ({ code, message }) => {
    return (
        <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
        <h1 className="gelatine text-9xl font-extrabold text-black">500</h1>
            <div className="relative block px-8 py-3 bg-black border border-current">
                <p className="text-white font-extrabold">SERVER ERROR</p>
            </div>
            <div className='mt-5 text-center text-black'>
                <p className="text-black font-semibold">Something went wrong</p>
                <p className='typewriter'>I'm not saying it's our fault, but it probably is</p>
            </div>
    </div>
    );
};


export default ErrorPage;