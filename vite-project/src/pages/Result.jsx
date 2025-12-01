// src/pages/Result.jsx (Subtype 메인 설명 출력 제거 및 요청 로직 포함 최종본)

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Progress } from '../components/Progress.jsx';

// 🎯 실제 백엔드 기본 URL 정의 (Test.js와 동일하게 설정)
const BASE_URL = 'http://15.164.52.207:8080';

// 🎯 Subtype 지표 레이블 정의 (좌/우 축) - 현재 구조에서는 사용되지 않음
const SubtypeDimensionLabels = {
    ST: { left: "사회적 (Social)", right: "사색적 (Thinking)" },
    AR: { left: "불안 (Anxious)", right: "억제 (Restrained)" },
    AF: { left: "친화 (Affiliative)", right: "활동 (Agentic)" }
};

const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const initialPostData = location.state?.resultData || null;
    const [resultData, setResultData] = useState(initialPostData);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const resultRef = useRef(null);

    const getDimensionPercentage = (score) => {
        const maxTotalScore = 48;
        return (score / maxTotalScore) * 100;
    };

    const getSubtypePercentage = (score) => {
        const maxScore = 10;
        return ((score + maxScore) / (maxScore * 2)) * 100;
    };

    const handleCaptureAndSave = async () => {
        if (!resultRef.current) return;

        try {
            const canvas = await html2canvas(resultRef.current, {
                allowTaint: true,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');

            link.download = `MBTI_Result_${resultData?.mbti || 'Test'}.png`;
            link.href = image;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('결과 이미지가 저장되었습니다!');

        } catch (err) {
            console.error('캡처 중 오류 발생:', err);
            alert('이미지 저장에 실패했습니다.');
        }
    };

    useEffect(() => {
        if (!initialPostData || !initialPostData.mbti || !initialPostData.subtype?.[0]) {
            alert("테스트 결과를 찾을 수 없습니다. (MBTI 또는 Subtype 정보 누락)");
            navigate('/');
            setLoading(false);
            return;
        }

        const mbtiName = initialPostData.mbti;
        const rawSubtypeName = initialPostData.subtype[0];

        const readableSubtypeName = rawSubtypeName.replace(/_/g, ' ');

        const fetchDetailedResult = async () => {
            setLoading(true);
            let mbtiDetails = {};
            let subtypeDetails = {};
            let hasError = false;

            try {
                const mbtiResponse = await fetch(`${BASE_URL}/api/mbti/${mbtiName}`);
                if (!mbtiResponse.ok) throw new Error(`MBTI (${mbtiName}) 상세 정보 로드 실패`);

                const data = await mbtiResponse.json();
                mbtiDetails = data.data || data;

            } catch (err) {
                console.error("MBTI 상세 GET 오류:", err);
                hasError = true;
                mbtiDetails = {
                    summary: `MBTI 상세 정보 로드 오류: ${err.message}`,
                    instruction: "MBTI 상세 설명을 가져올 수 없습니다.",
                    img_url: 'https://via.placeholder.com/300x300?text=MBTI+Error'
                };
            }

            try {
                const encodedSubtypeName = encodeURIComponent(readableSubtypeName);
                const subtypeResponse = await fetch(`${BASE_URL}/api/mbti/${encodedSubtypeName}`);

                if (!subtypeResponse.ok) throw new Error(`Subtype (${readableSubtypeName}) 상세 정보 로드 실패`);

                const data = await subtypeResponse.json();
                subtypeDetails = data.data || data;

            } catch (err) {
                console.error("Subtype 상세 GET 오류:", err);
                hasError = true;
                subtypeDetails = { subtype_error: `Subtype 상세 정보 로드 오류: ${err.message}` };
            }

            if (hasError) {
                setError("일부 상세 정보(MBTI 또는 Subtype)를 불러오는 데 실패했습니다. 기본 정보로 렌더링합니다.");
            }

            setResultData(prevData => ({
                ...prevData,
                mbti_img_url: mbtiDetails.img_url,
                summary: mbtiDetails.summary,
                mbti_instruction: mbtiDetails.instruction,

                subtype_img_url: subtypeDetails.img_url,
                subtype_name_detail: subtypeDetails.type,
                instruction: subtypeDetails.instruction,
                analysis_text: subtypeDetails.analysis_text || subtypeDetails.instruction,
                emoji: subtypeDetails.emoji,

                mbti_error: mbtiDetails.summary?.includes("로드 오류") ? mbtiDetails.summary : undefined,
                subtype_error: subtypeDetails.subtype_error,
            }));

            setLoading(false);
        };

        fetchDetailedResult();
    }, [location.state, navigate]);

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem', color: '#8b5cf6' }}>
                <h1 className="main-heading">상세 결과 분석 중...</h1>
                <p>MBTI 및 서브타입 상세 정보를 불러오고 있습니다…</p>
            </div>
        );
    }

    if (!resultData || !resultData.mbti) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem', color: '#dc2626' }}>
                <p>유효한 테스트 결과 데이터가 없습니다. (테스트를 먼저 완료해 주세요.)</p>
                <Button onClick={() => navigate('/test')} variant="primary" size="lg" style={{ marginTop: '1rem' }}>
                    재검사 하기
                </Button>
            </div>
        );
    }

    const type = resultData.mbti;
    const scores = resultData.scores;

    const subtypeCode = resultData.subtype?.[0];
    const subtypeName = resultData.subtype_name_detail || subtypeCode?.replace(/_/g, ' ') || "Subtype 분석 불가";

    const summary = resultData.summary || "MBTI 유형 상세 요약(summary)이 포함되지 않았습니다.";
    const mbtiDescription = resultData.mbti_instruction || "MBTI 상세 설명이 포함되지 않았습니다.";
    const mbtiImageUrl = resultData.mbti_img_url || 'https://via.placeholder.com/300x300?text=MBTI+Image';

    const subtypeImageUrl = resultData.subtype_img_url || 'https://via.placeholder.com/200x200?text=Subtype+Image';
    const subtypeAnalysisText = resultData.analysis_text || "서브타입 심층 분석 내용이 포함되지 않았습니다.";
    const subtypeEmoji = resultData.emoji || "⭐";

    return (
        <div ref={resultRef} className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: '900px', background: '#f9fafb' }}>
            <h1 className="main-heading" style={{ fontSize: '3rem', textAlign: 'center' }}>
                당신의 트렌드 MBTI 결과는?
            </h1>

            {/* MBTI 결과 카드 */}
            <Card className="card-container" style={{ padding: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#8b5cf6' }}>
                    MBTI 유형: {type}
                </h2>

                <img
                    src={mbtiImageUrl}
                    alt={`${type} 결과 이미지`}
                    style={{ width: '100%', maxWidth: '300px', borderRadius: '10px', objectFit: 'cover', margin: '1rem auto' }}
                />

                <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0', gap: '1rem' }}>
                    <Button
                        variant="primary"
                        size="lg"
                        onClick={handleCaptureAndSave}
                        style={{
                            background: 'linear-gradient(to right, #8b5cf6, #ec4899, #3b82f6)',
                            color: 'white',
                            border: 'none',
                            fontWeight: 'bold'
                        }}
                    >
                        💾 이미지 저장
                    </Button>
                </div>
            </Card>

            {/* MBTI 지표 점수 */}
            <Card className="card-container" style={{ padding: '2rem', textAlign: 'left', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#4b5563' }}>
                    MBTI 지표 점수 분석
                </h3>

                {scores ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {["E", "S", "T", "J"].map((key) => (
                            <div key={key}>
                                <Progress value={getDimensionPercentage(scores[key])} />
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                                    {key} 점수: {scores[key]} (총점 48점 중)
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#ef4444' }}>점수 정보가 포함되지 않았습니다.</p>
                )}
            </Card>

            {/* MBTI 전체 설명 */}
            <Card className="card-container" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'left', border: '2px solid #8b5cf6' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#8b5cf6' }}>
                    MBTI 유형 상세 해석: {summary}
                </h3>
                <p style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.6' }}>
                    {mbtiDescription}
                </p>
            </Card>

            {/* Subtype 분석 */}
            {subtypeCode && (
                <Card className="card-container" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'left', border: '2px solid #a78bfa' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#8b5cf6' }}>
                        {subtypeEmoji} 서브타입 분석: {subtypeName}
                    </h3>

                    <img
                        src={subtypeImageUrl}
                        alt={`${subtypeName} 서브타입 이미지`}
                        style={{ width: '100%', maxWidth: '200px', borderRadius: '10px', objectFit: 'cover', margin: '1rem auto' }}
                    />

                    <h4 style={{ fontSize: '1.125rem', color: '#4b5563', marginTop: '1rem' }}>심층 분석</h4>
                    <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.4' }}>
                        {subtypeAnalysisText}
                    </p>
                </Card>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', gap: '1rem' }}>
                <Button variant="outline" size="lg" onClick={() => navigate('/test')}>
                    재검사 하기
                </Button>
                <Button
                    size="lg"
                    onClick={() => navigate('/')}
                    style={{
                        background: 'linear-gradient(to right, #8b5cf6, #ec4899, #3b82f6)',
                        color: 'white'
                    }}
                >
                    홈으로 돌아가기
                </Button>
            </div>
        </div>
    );
};

export default Result;
