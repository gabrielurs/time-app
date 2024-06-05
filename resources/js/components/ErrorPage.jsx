import React from "react";

const ErrorPage = ({ code, message }) => {
    return (
        <div>
            <h1>{code}</h1>
            <p>{message}</p>
        </div>
    );
};