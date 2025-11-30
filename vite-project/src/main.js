import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from "./pages/MainPage.js";
import ShowAllTypePage from "./pages/ShowAllTypePage.js";

createRoot(document.getElementById('root')).render(
    createElement(
        StrictMode,
        null,
        createElement(
            BrowserRouter,
            null,
            createElement(
                Routes,
                null,
                [
                    createElement(Route, {
                        key: "main",
                        path: "/",
                        element: createElement(MainPage)
                    }),
                    createElement(Route, {
                        key: "showAll",
                        path: "/ShowAllTypePage",
                        element: createElement(ShowAllTypePage)
                    })
                ]
            )
        )
    )
);
