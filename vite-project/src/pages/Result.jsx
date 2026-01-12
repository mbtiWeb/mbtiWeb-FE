import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';

// 🎯 API 엔드포인트 설정
const RESULT_URL = import.meta.env.VITE_API_RESULT_URL;

const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialPostData = location.state?.resultData || null;

    const [resultData, setResultData] = useState(initialPostData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ✨ 서브타입 더보기 상태 (기본 1개만 노출)
    const [subtypeLimit, setSubtypeLimit] = useState(1);
    const resultRef = useRef(null);

    const getDimensionPercentage = (score) => {
        if (score === undefined || score === null) return 50;
        const maxScore = 35;
        const minScore = 5;
        const percentage = ((score - minScore) / (maxScore - minScore)) * 100;
        return Math.min(Math.round(percentage), 100);
    };

    const dimensions = [
        { left: "I", right: "E", key: "I" },
        { left: "S", right: "N", key: "S" },
        { left: "F", right: "T", key: "F" },
        { left: "P", right: "J", key: "P" }
    ];

    const handleCaptureAndSave = async () => {
        if (!resultRef.current) return;
        const dpr = window.devicePixelRatio || 1;
        try {
            const canvas = await html2canvas(resultRef.current, {
                useCORS: true,       // 외부 이미지 허용
                allowTaint: false,   // 보안 설정 (CORS와 세트)
                backgroundColor: '#f9fafb', // 배경색 명시
                scale: 3,            // 화질 대폭 상향 (기존 2 -> 3)
                logging: false,
                onclone: (clonedDoc) => {
                    // 캡처용 복사본에서 모든 이미지의 투명도를 1(선명함)로 강제 고정
                    const images = clonedDoc.querySelectorAll('img');
                    images.forEach(img => {
                        img.style.opacity = "1";
                        img.style.filter = "none";
                    });
                }
            });
            const image = canvas.toDataURL('image/png', 1.0); // 최고 품질 저장
            const link = document.createElement('a');
            link.download = `MBTI_Result_${resultData?.mbti}.png`;
            link.href = image;
            link.click();
        } catch (err) {
            alert('이미지 저장에 실패했습니다.');
        }
    }

    useEffect(() => {
        if (!initialPostData?.mbti) {
            navigate('/');
            return;
        }

        const fetchDetailedResult = async () => {
            setLoading(true);
            const mbtiName = initialPostData.mbti;
            const readableSubtypeList = initialPostData.subtype.map(name => name.replace(/_/g, ' '));

            try {
                const response = await fetch(`${RESULT_URL}/api/mbti/summarize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mbti_names: [mbtiName, ...readableSubtypeList]
                    })
                });

                if (!response.ok) throw new Error("상세 정보를 가져오는 데 실패했습니다.");

                const data = await response.json();

                // 데이터 분리: 메인 유형 1개와 서브타입 배열 전체 추출
                const mbtiInfo = data.mbti_list.find(item => !item.is_subtype) || {};
                const allSubtypes = data.mbti_list.filter(item => item.is_subtype) || [];

                const fullInstruction = data.summarized_instruction
                    ? Object.values(data.summarized_instruction).join('\n\n')
                    : "";

                setResultData(prev => ({
                    ...prev,
                    mbti_info: mbtiInfo,
                    subtypes: allSubtypes, // ✨ 모든 서브타입을 배열로 저장
                    summary: `${mbtiInfo.type} 분석 결과`,
                    mbti_instruction: fullInstruction,
                    emoji: "✨"
                }));

            } catch (err) {
                console.error("데이터 로딩 오류", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetailedResult();
    }, [initialPostData, navigate]);

    if (loading) {
        return (
            <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', color: '#8b5cf6' }}>
                <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }} />
                <h2 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 'bold' }}>당신의 성향을 분석 중입니다...</h2>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (error) return <div className="container" style={{ textAlign: 'center', padding: '5rem', color: '#ef4444' }}>{error}</div>;

    return (
        <div ref={resultRef} className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '750px', background: '#f9fafb', minHeight: '100vh' }}>
            <h1 className="main-heading" style={{ fontSize: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>MBTI 테스트 결과</h1>

            {/* 1. MBTI & 서브타입 리스트 카드 */}
            <Card style={{ padding: '2rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '2.2rem', color: '#8b5cf6', margin: 0 }}>{resultData.mbti}</h2>
                </div>

                {/* 메인 MBTI 이미지 */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <img src={resultData.mbti_info?.img_url} alt="mbti" style={{ width: '180px', borderRadius: '15px', border: '3px solid #f3f4f6' }} />
                </div>

                <div style={{ fontSize: '1rem', color: '#8b5cf6', marginBottom: '0.7rem', fontWeight: 'bold' }}>▼ 당신의 서브타입 ▼</div>
                <div style={{ fontSize: '0.95rem', color: '#8b5cf6', marginBottom: '1.5rem' }}>전체 12종 중 {resultData.subtypes?.length || 0}종</div>

                {/* ✨ 서브타입 리스트 렌더링 (더보기 적용) */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {resultData.subtypes?.slice(0, subtypeLimit).map((sub, index) => (
                        <div key={index} style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
                            <img src={sub.img_url} alt={sub.type} crossOrigin="anonymous" style={{ width: '140px', borderRadius: '15px', border: '3px solid #ec4899', opacity: 1}} />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#ec4899', fontWeight: 'bold' }}>{sub.type}</p>
                        </div>
                    ))}
                </div>

                {/* ✨ 서브타입 더보기 버튼 */}
                {resultData.subtypes?.length > subtypeLimit && (
                    <button
                        onClick={() => setSubtypeLimit(prev => prev + 3)}
                        style={{ background: '#f3f4f6', border: 'none', padding: '8px 16px', borderRadius: '20px', color: '#4b5563', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' }}
                    >
                        서브타입 더보기 +({resultData.subtypes.length - subtypeLimit})
                    </button>
                )}

                <div>
                    <Button onClick={handleCaptureAndSave} style={{ background: 'linear-gradient(to right, #8b5cf6, #ec4899)', border: 'none', color: '#fff', padding: '0.8rem 2rem' }}>
                        💾 결과 이미지 저장
                    </Button>
                    <p style={{ fontSize: '0.7rem', color: '#ec4899' }}>PC에서 저장하는 걸 추천해요!</p>
                </div>
            </Card>

            {/* 2. 성향 지표 분석 */}
            <Card style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '1.5rem', textAlign: 'center' }}>
                    성향 수치 리포트
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {dimensions.map((dim) => {
                        let leftPercent = getDimensionPercentage(resultData.scores?.[dim.key]);
                
                        if (leftPercent === 50) {
                            leftPercent = 51;
                        }

                        const rightPercent = 100 - leftPercent;
                        const isLeftStrong = leftPercent >= 50;

                        return (
                            <div key={dim.key}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 5px' }}>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: isLeftStrong ? '#8b5cf6' : '#9ca3af', width: '30px' }}>
                                        {dim.left}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold' }}>
                                        {isLeftStrong ? `${leftPercent}%` : `${rightPercent}%`}
                                    </span>
                                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: !isLeftStrong ? '#8b5cf6' : '#9ca3af', width: '30px', textAlign: 'right' }}>
                                        {dim.right}
                                    </span>
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

            {/* 3. 상세 분석 설명 (기존 방식 유지) */}
            <Card style={{ padding: '1.5rem', marginBottom: '1.25rem', borderLeft: '5px solid #8b5cf6' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#8b5cf6', marginBottom: '1.2rem', textAlign: 'center' }}>
                    {resultData.emoji} 상세 성향 분석
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#374151', margin: 0, whiteSpace: 'pre-wrap', textAlign: 'justify', wordBreak: 'normal' }}>
                    {resultData.mbti_instruction}
                </p>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem', gap: '1rem' }}>
                <Button variant="outline" onClick={() => navigate('/test')}>다시하기</Button>
                <Button onClick={() => navigate('/')} style={{ background: '#8b5cf6', color: '#fff' }}>홈으로</Button>
            </div>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
};

export default Result;