import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../components/Home";
import NotFoundPage from "../components/NotFoundPage";
import ErrorPage from "../components/ErrorPage";

const initialState = window.__INITIAL_STATE__;

const Router = () => {
    return (
        <div>
            <Routes>
                {initialState?.errorCode ? (
                    <Route
                        path="*"
                        element={
                            <ErrorPage/>
                        }
                    />
                ) : (
                    <>
                        <Route path="/" element={<Home />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </>
                )}
            </Routes>
        </div>
    );
};

export default Router;
