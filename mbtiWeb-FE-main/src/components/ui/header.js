import React, { createElement } from "react";
import "./header.css";
import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();

    return createElement(
        "header",
        { className: "nav-bar" },
        [
            createElement("div", { className: "logo", key: "logo" }, "🙂"),
            createElement(
                "nav",
                { className: "nav-menu", key: "nav" },
                [
                    createElement(
                        "button",
                        {
                            className: "home-button",
                            key: "home-btn",
                            onClick: () => navigate("/"),
                        },
                        "홈"
                    ),
                    createElement(
                        "button",
                        {
                            className: "alltype-button",
                            key: "all-btn",
                            onClick: () => navigate("/showAllTypePage"),
                        },
                        "모든 유형"
                    )
                ]
            )
        ]
    );
}

export default Header;
