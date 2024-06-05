import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../components/Home";
import NotFoundPage from "../components/NotFoundPage";


const Router = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}

export default Router;