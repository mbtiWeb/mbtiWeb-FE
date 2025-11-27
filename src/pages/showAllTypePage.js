import React, { createElement, useEffect, useState } from "react";
import "./showAllTypePage.css";

function ShowAllTypePage() {
    const [mbtiList, setMbtiList] = useState([]);
    const [subtypeList, setSubtypeList] = useState([]);
    const [loading, setLoading] = useState(true); // 로딩중 상태 확인
    const [error, setError] = useState(null); // 에러 상태 확인

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

                // 데이터 분리해서 저장하기
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

    // 로딩 중 상태 확인
    if (loading) {
        return createElement(
            "div",
            { className: "home-container" },
            createElement("div", { className: "loading" }, "데이터 불러오는 중…")
        );
    }

    if (error) {
        return createElement(
            "div",
            { className: "home-container" },
            createElement("div", { className: "error" }, error)
        );
    }

    function createCard(item) {
        return createElement(
            "div",
            { className: "mbti-card-box", key: item.id },
            [
                createElement("img", {
                    key: "img",
                    src: item.imgUrl,
                    alt: item.type,
                    className: "mbti-card-image"
                }),
                createElement(
                    "div",
                    { key: "txt", className: "mbti-card-text" },
                    [
                        createElement(
                            "h3",
                            { key: "title", className: "mbti-card-title" },
                            item.type
                        ),
                        createElement(
                            "p",
                            { key: "summary", className: "mbti-card-summary" },
                            item.summary
                        )
                    ]
                )
            ]
        );
    }

    return createElement(
        "div",
        { className: "home-container" },
        [
            createElement(
                "section",
                { className: "mbti-section", key: "mbti-section" },
                [
                    createElement("h2", { className: "section-title", key: "title1" }, "MBTI 유형"),
                    createElement(
                        "div",
                        { className: "grid-container", key: "grid1" },
                        mbtiList.map(item => createCard(item))
                    )
                ]
            ),

            createElement(
                "section",
                { className: "subtype-section", key: "subtype-section" },
                [
                    createElement("h2", { className: "section-title", key: "title2" }, "SUBTYPE 유형"),
                    createElement(
                        "div",
                        { className: "grid-container", key: "grid2" },
                        subtypeList.map(item => createCard(item))
                    )
                ]
            )
        ]
    );
}

export default ShowAllTypePage;
