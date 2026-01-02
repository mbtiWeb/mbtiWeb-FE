import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();

    return (
        <header className="nav-bar">
            <div className="logo" />
            <nav className="nav-menu">
                <button
                    className="home-button"
                    onClick={() => navigate("/")}
                >
                    홈
                </button>

                <button
                    className="alltype-button"
                    onClick={() => navigate("/showAllTypePage")}
                >
                    모든유형
                </button>
            </nav>
        </header>
    );
}

export default Header;
