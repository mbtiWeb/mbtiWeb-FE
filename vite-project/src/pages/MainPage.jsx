import React from "react";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";

function MainPage() {
    const navigate = useNavigate();

    return (
        <div className="home-container">

            {/* Hero Section */}
            <section className="hero-section">
                <span className="badge">New Trend MBTI Test</span>
                <h2 className="main-title">나를 발견하는 특별한 여정</h2>
                <p className="sub-text">
                    MBTI와 최신 트렌드를 결합한 새로운 성격 검사로 나만의 독특한 매력과 가능성을 발견해보세요.
                </p>

                <div className="hero-buttons">
                    <button
                        className="start-btn"
                        onClick={() => navigate("/Test")}
                    >
                        검사 시작하기 →
                    </button>

                    <button
                        className="view-all-btn"
                        onClick={() => navigate("/ShowAllTypePage")}
                    >
                        모든 유형 보기
                    </button>
                </div>

                <div className="small-info">
                    <span className="info-item">
                        <span className="dot dot-green">●</span> 56개 문항
                    </span>
                    <span className="info-item">
                        <span className="dot dot-blue">●</span> 약 5분 소요
                    </span>
                    <span className="info-item">
                        <span className="dot dot-purple">●</span> 무료
                    </span>
                </div>
            </section>

            {/* Why Section */}
            <section className="why-section">
                <h3>
                    왜 <span className = "logo-highlight"> SoyYo</span>를 선택해야 할까요?
                </h3>
                <div className="why-cards">
                    {["정확한 분석", "트렌드 반영", "개인화 성격 리포트", "5분 완성"].map((title, i) => (
                        <div className="why-card" key={i}>
                            <h4>{title}</h4>
                            <p>
                                {
                                    [
                                        <>MBTI 기반 <br />과학적 성격 분석</>,
                                        <>최신 트렌드와 결합한 <br />새로운 인사이트</>,
                                        <>나만의 독특한 <br />성격 유형 발견</>,
                                        <>간단하고 <br/> 빠른 검사</>
                                    ][i]
                                }
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Steps Section */}
            <section className="steps-section">
                <h3>어떻게 진행되나요?</h3>
                <div className="steps">
                    {[1, 2, 3].map((num, i) => (
                        <div className="step" key={i}>
                            <span className="circle">{num}</span>
                            <p>
                                {["질문 답하기", "점수 계산", "결과 확인"][i]}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <p className="cta-title">지금 바로 시작해보세요</p>
                <p className="cta-sub">
                    수백만 명이 선택한 검사로 나의 진짜 모습을 발견하고, 새로운 가능성을 탐색해보세요.
                </p>
                <button
                    className="cta-btn"
                    onClick={() => navigate("/Test")}
                    >
                    무료로 시작하기 →
                </button>
            </section>
        </div>
    );
}

export default MainPage;
