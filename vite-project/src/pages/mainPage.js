import React from "react";
import "./mainPage.css";
import { useNavigate } from "react-router-dom";
import Header from "../components/header.js";   // ← header.js 불러오기

function mainPage() {
    const navigate = useNavigate();

    return React.createElement(
        "div",
        { className: "home-container" },

        // ⭐ Header 컴포넌트 불러오기
        React.createElement(Header, null),

        // Hero Section
        React.createElement(
            "section",
            { className: "hero-section" },

            React.createElement("span", { className: "badge" }, "New Trend MBTI Test"),
            React.createElement("h2", { className: "main-title" }, "나를 발견하는 특별한 여정"),
            React.createElement(
                "p",
                { className: "sub-text" },
                "MBTI와 최신 트렌드를 결합한 새로운 성격 검사로 나만의 독특한 매력과 가능성을 발견해보세요."
            ),

            React.createElement(
                "div",
                { className: "hero-buttons" },
                React.createElement(
                    "button",
                    { className: "start-btn" },
                    "검사 시작하기 →"
                ),
                React.createElement(
                    "button",
                    {
                        className: "view-all-btn",
                        onClick: () => navigate("/showAllTypePage")
                    },
                    "모든 유형 보기"
                )
            ),

            React.createElement(
                "div",
                { className: "small-info" },
                React.createElement(
                    "span",
                    { className: "info-item" },
                    React.createElement("span", { className: "dot dot-green" }, "●"), " 20개 문항"
                ),
                React.createElement(
                    "span",
                    { className: "info-item" },
                    React.createElement("span", { className: "dot dot-blue" }, "●"), " 약 5분 소요"
                ),
                React.createElement(
                    "span",
                    { className: "info-item" },
                    React.createElement("span", { className: "dot dot-purple" }, "●"), " 무료"
                )
            )
        ),

        // Why Section
        React.createElement(
            "section",
            { className: "why-section" },
            React.createElement("h3", null, "왜 🙂을 선택해야 할까요?"),
            React.createElement(
                "div",
                { className: "why-cards" },

                ["정확한 분석", "트렌드 반영", "16가지 유형", "5분 완성"].map((title, i) =>
                    React.createElement(
                        "div",
                        { className: "why-card", key: i },
                        React.createElement("h4", null, title),
                        React.createElement(
                            "p",
                            null,
                            [
                                "MBTI 기반 과학적 성격 분석",
                                "최신 트렌드와 결합한 새로운 인사이트",
                                "나만의 독특한 성격 유형 발견",
                                "간단하고 빠른 검사"
                            ][i]
                        )
                    )
                )
            )
        ),

        // Steps Section
        React.createElement(
            "section",
            { className: "steps-section" },
            React.createElement("h3", null, "어떻게 진행되나요?"),
            React.createElement(
                "div",
                { className: "steps" },
                [1, 2, 3].map((num, i) =>
                    React.createElement(
                        "div",
                        { className: "step", key: i },
                        React.createElement("span", { className: "circle" }, num),
                        React.createElement("p", null, ["질문 답하기", "점수 계산", "결과 확인"][i])
                    )
                )
            )
        ),

        // CTA Section
        React.createElement(
            "section",
            { className: "cta-section" },
            React.createElement("p", { className: "cta-title" }, "지금 바로 시작해보세요"),
            React.createElement(
                "p",
                { className: "cta-sub" },
                "수백만 명이 선택한 검사로 나의 진짜 모습을 발견하고, 새로운 가능성을 탐색해보세요."
            ),
            React.createElement(
                "button",
                { className: "cta-btn" },
                "무료로 시작하기 →"
            )
        )
    );
}

export default mainPage;