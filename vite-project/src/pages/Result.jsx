import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';

const BASE_URL = 'http://15.164.52.207:8080';

const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialPostData = location.state?.resultData || null;
    const [resultData, setResultData] = useState(initialPostData);
    const [loading, setLoading] = useState(true);
    const resultRef = useRef(null);

    // 🎯 퍼센트 계산 (48점 만점 기준)
    const getDimensionPercentage = (score) => {
        if (score === undefined || score === null) return 50;
        const maxTotalScore = 48;
        const percentage = (score / maxTotalScore) * 100;
        return Math.min(Math.round(percentage), 100);
    };

    const dimensions = [
        { left: "E", right: "I", key: "E" },
        { left: "S", right: "N", key: "S" },
        { left: "T", right: "F", key: "T" },
        { left: "J", right: "P", key: "J" }
    ];

    const handleCaptureAndSave = async () => {
        if (!resultRef.current) return;
        try {
            const canvas = await html2canvas(resultRef.current, {
                allowTaint: true,
                useCORS: true,
                backgroundColor: '#f9fafb',
                scale: 2
            });
            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `MBTI_Result_${resultData?.mbti}.png`;
            link.href = image;
            link.click();
        } catch (err) {
            alert('이미지 저장에 실패했습니다.');
        }
    };

    useEffect(() => {
        if (!initialPostData?.mbti) {
            navigate('/');
            return;
        }

        const fetchDetailedResult = async () => {
            setLoading(true);
            const mbtiName = initialPostData.mbti;
            const rawSubtypeName = initialPostData.subtype[0];
            const readableSubtypeName = rawSubtypeName.replace(/_/g, ' ');

            try {
                const [mbtiRes, subtypeRes] = await Promise.all([
                    fetch(`${BASE_URL}/api/mbti/${mbtiName}`),
                    fetch(`${BASE_URL}/api/mbti/${encodeURIComponent(readableSubtypeName)}`)
                ]);

                const mbtiData = await mbtiRes.json();
                const subtypeData = await subtypeRes.json();

                const mbtiDetails = mbtiData.data || mbtiData;
                const subtypeDetails = subtypeData.data || subtypeData;

                setResultData(prev => ({
                    ...prev,
                    mbti_img_url: mbtiDetails.img_url,
                    summary: mbtiDetails.summary,
                    mbti_instruction: mbtiDetails.instruction,
                    subtype_img_url: subtypeDetails.img_url,
                    subtype_name_detail: subtypeDetails.type,
                    analysis_text: subtypeDetails.analysis_text || subtypeDetails.instruction,
                    emoji: subtypeDetails.emoji,
                }));
            } catch (err) {
                console.error("데이터 로딩 오류", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetailedResult();
    }, [initialPostData, navigate]);

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>분석 중...</div>;

    return (
        <div ref={resultRef} className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '750px', background: '#f9fafb', minHeight: '100vh' }}>
            <h1 className="main-heading" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>MBTI 테스트 결과</h1>

            {/* 1. 결과 요약 카드 */}
            <Card style={{ padding: '1.25rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '2.2rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>{resultData.mbti}</h2>
                <img src={resultData.mbti_img_url} alt="mbti" style={{ width: '100%', maxWidth: '220px', borderRadius: '15px', margin: '0.5rem 0' }} />
                <div style={{ marginTop: '1rem' }}>
                    <Button onClick={handleCaptureAndSave} style={{ background: 'linear-gradient(to right, #8b5cf6, #ec4899)', border: 'none', color: '#fff' }}>
                        💾 결과 이미지 저장
                    </Button>
                </div>
            </Card>

            {/* 2. 성향 지표 분석 (중앙 선 없음) */}
            <Card style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '1.5rem', textAlign: 'center' }}>성향 지표 분석 (%)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {dimensions.map((dim) => {
                        const leftPercent = getDimensionPercentage(resultData.scores?.[dim.key]);
                        const rightPercent = 100 - leftPercent;
                        const isLeftStrong = leftPercent >= 50;

                        return (
                            <div key={dim.key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 5px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isLeftStrong ? '#8b5cf6' : '#9ca3af', width: '30px' }}>{dim.left}</span>
                                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold' }}>
                                        {isLeftStrong ? `${leftPercent}%` : `${rightPercent}%`}
                                    </span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: !isLeftStrong ? '#8b5cf6' : '#9ca3af', width: '30px', textAlign: 'right' }}>{dim.right}</span>
                                </div>
                                <div style={{ width: '100%', height: '14px', background: '#e5e7eb', borderRadius: '7px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: isLeftStrong ? 0 : 'auto',
                                        right: !isLeftStrong ? 0 : 'auto',
                                        width: `${isLeftStrong ? leftPercent : rightPercent}%`,
                                        height: '100%',
                                        background: 'linear-gradient(to right, #8b5cf6, #a78bfa)',
                                        borderRadius: '7px',
                                        transition: 'width 0.6s ease-out'
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* 3. 상세 설명 */}
            <Card style={{ padding: '1.25rem', marginBottom: '1.25rem', borderLeft: '5px solid #8b5cf6' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#8b5cf6', marginBottom: '0.5rem' }}>{resultData.summary}</h3>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#374151', margin: 0 }}>{resultData.mbti_instruction}</p>
            </Card>

            {/* 4. 서브타입 (상하 배치 레이아웃 수정) */}
            <Card style={{ padding: '1.5rem', border: '1.5px solid #a78bfa', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#8b5cf6', marginBottom: '1.5rem' }}>
                    {resultData.emoji} 서브타입: {resultData.subtype_name_detail}
                </h3>
                
                {/* 이미지를 먼저 중앙에 배치 */}
                <img 
                    src={resultData.subtype_img_url} 
                    alt="subtype" 
                    style={{ width: '100%', maxWidth: '180px', borderRadius: '15px', objectFit: 'cover', marginBottom: '1.5rem' }} 
                />
                
                {/* 텍스트를 이미지 밑에 배치 */}
                <div style={{ textAlign: 'left', background: '#f5f3ff', padding: '1rem', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '1rem', color: '#4b5563', marginBottom: '0.5rem' }}>심층 분석</h4>
                    <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: '1.6', margin: 0 }}>
                        {resultData.analysis_text}
                    </p>
                </div>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem', gap: '1rem' }}>
                <Button variant="outline" onClick={() => navigate('/test')}>다시하기</Button>
                <Button onClick={() => navigate('/')} style={{ background: '#8b5cf6', color: '#fff' }}>홈으로</Button>
            </div>
        </div>
    );
};

export default Result;