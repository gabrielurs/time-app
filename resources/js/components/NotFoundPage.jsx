import React from 'react';
import { Link } from 'react-router-dom';
import './css/404.css';
const NotFoundPage = () => {
    return (
        <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
        <h1 className="gelatine text-9xl font-extrabold text-black">404</h1>
            <div className="relative block px-8 py-3 bg-black border border-current">
                <p className="text-white font-extrabold">PAGE NOT FOUND</p>
            </div>
            <div className='mt-5 text-center text-black'>
                <p className='typewriter'>I'm not saying it's your fault, but it probably is</p>
                <Link to='/'>Come <strong className="text-black">home</strong> before you get lost.</Link>
            </div>
    </div>
    );
};

export default NotFoundPage;