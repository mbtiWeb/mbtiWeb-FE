import { StrictMode, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import mainPage from "./pages/mainPage.js";
//import showAllTypePage from "./pages/showAllTypePage.js";

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
                        element: createElement(mainPage)
                    })
                    /*
                    createElement(Route, {
                        key: "showAll",
                        path: "/ShowAllTypePage",
                        element: createElement(showAllTypePage)
                    })
                    */
                ]
            )
        )
    )
);
