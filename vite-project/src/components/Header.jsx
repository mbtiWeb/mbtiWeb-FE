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
                    <span className="text-PC">모든 유형</span>
                    <span className="text-mobile">
                        모든<br />유형
                    </span>
                </button>
            </nav>
        </header>
    );
}

export default Header;
