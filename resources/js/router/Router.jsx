import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../components/Home";
import NotFoundPage from "../components/NotFoundPage";

const Router = () => {
    return (
        <div>
            <Routes>
                {initialState?.errorCode ? (
                    <Route
                        path="*"
                        element={
                            <ErrorPage
                                code={initialState.errorCode}
                                message={initialState.errorMessage}
                            />
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
