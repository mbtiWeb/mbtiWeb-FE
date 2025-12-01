import React, { useEffect, useState } from "react";
import "./ShowAllTypePage.css";
import Header from "../components/Header.jsx";

function ShowAllTypePage() {
    const [mbtiList, setMbtiList] = useState([]);
    const [subtypeList, setSubtypeList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("http://15.164.52.207:8080/api/mbti/all")
            .then((res) => {
                if (!res.ok) throw new Error("서버 응답 없음");
                return res.json();
            })
            .then((data) => {
                const transData = data.map(item => ({
                    id: item.id,
                    imgUrl: item.img_url,
                    isSubtype: item.is_subtype,
                    summary: item.summary,
                    type: item.type
                }));

                const mbti = transData.filter(item => !item.isSubtype);
                const subtype = transData.filter(item => item.isSubtype);

                setMbtiList(mbti);
                setSubtypeList(subtype);
            })
            .catch((err) => {
                console.error("API 오류:", err);
                setError("오류가 발생했습니다.");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="home-container">
                <div className="loading">데이터 불러오는 중…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    // Card Component
    const Card = ({ item }) => (
        <div className="mbti-card-box" key={item.id}>
            <img src={item.imgUrl} alt={item.type} className="mbti-card-image" />
            <div className="mbti-card-text">
                <h3 className="mbti-card-title">{item.type}</h3>
                <p className="mbti-card-summary">{item.summary}</p>
            </div>
        </div>
    );

    return (
        <div className="home-container">

            {/* MBTI 기본 유형 */}
            <section className="mbti-section">
                <h2 className="section-title">MBTI 유형</h2>
                <div className="grid-container">
                    {mbtiList.map(item => (
                        <Card key={item.id} item={item} />
                    ))}
                </div>
            </section>

            {/* SUBTYPE 유형 */}
            <section className="subtype-section">
                <h2 className="section-title">SUBTYPE 유형</h2>
                <div className="grid-container">
                    {subtypeList.map(item => (
                        <Card key={item.id} item={item} />
                    ))}
                </div>
            </section>
        </div>
    );
}

export default ShowAllTypePage;
