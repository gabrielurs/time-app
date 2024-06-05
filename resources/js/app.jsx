import React from "react"
import ReactDOM from 'react-dom/client';        
import { BrowserRouter } from "react-router-dom";
import Router from "./router/Router.jsx";


ReactDOM.createRoot(document.getElementById('app')).render(     
    <BrowserRouter>
    <Router/>
    </BrowserRouter>
);