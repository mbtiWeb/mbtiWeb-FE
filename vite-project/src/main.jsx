import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from "react-router-dom";
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <App/>
        </BrowserRouter>
    </StrictMode>
);

/*
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import MainPage from "./pages/MainPage.jsx";
import ShowAllTypePage from "./pages/ShowAllTypePage.jsx";
import Test from "./pages/Test.jsx";
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/showAllTypePage" element={<ShowAllTypePage />} />
                <Route path="/test" element={<Test />} />
            </Routes>
        </BrowserRouter>
    </StrictMode>
);
*/