// src/pages/Result.js (Subtype 메인 설명 출력 제거 및 요청 로직 포함 최종본)

import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import html2canvas from 'html2canvas'; 
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress'; 

// 🎯 실제 백엔드 기본 URL 정의 (Test.js와 동일하게 설정)
const BASE_URL = 'http://15.164.52.207:8080';

// 🎯 Subtype 지표 레이블 정의 (좌/우 축) - 현재 구조에서는 사용되지 않음
const SubtypeDimensionLabels = {
    "ST": { left: "사회적 (Social)", right: "사색적 (Thinking)" },
    "AR": { left: "불안 (Anxious)", right: "억제 (Restrained)" },
    "AF": { left: "친화 (Affiliative)", right: "활동 (Agentic)" } 
};

const Result = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // POST 응답 데이터는 초기 데이터로 유지
    const initialPostData = location.state?.resultData || null;
    const [resultData, setResultData] = useState(initialPostData); 
    
    // ⭐️ 상세 정보를 GET으로 가져와야 하므로 로딩은 true로 시작 ⭐️
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const resultRef = useRef(null); 

    // MBTI 지표 점수를 퍼센트로 변환하는 함수 (Progress Bar용)
    const getDimensionPercentage = (score) => {
        // ⚠️ 점수 범위가 0~48 (24*2)일 경우, 0~100%로 변환합니다.
        const maxTotalScore = 48; 
        return (score / maxTotalScore) * 100;
    };
    
    // Subtype 지표 점수를 퍼센트로 변환하는 함수 (Progress Bar용)
    const getSubtypePercentage = (score) => {
        const maxScore = 10; 
        return ((score + maxScore) / (maxScore * 2)) * 100;
    };

    // --- 공유 및 저장 함수 ---
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
    
    // --- 데이터 로딩 (POST 응답 후 상세 정보 GET) ---
    useEffect(() => {
        
        if (!initialPostData || !initialPostData.mbti || !initialPostData.subtype?.[0]) {
            alert("테스트 결과를 찾을 수 없습니다. (MBTI 또는 Subtype 정보 누락)");
            navigate('/');
            setLoading(false);
            return;
        }

        const mbtiName = initialPostData.mbti;
        const rawSubtypeName = initialPostData.subtype[0]; // 'mild_ambivert'와 같은 코드

        // ⭐️ Subtype 코드를 이름 형식으로 변환: mild_ambivert -> mild ambivert ⭐️
        const readableSubtypeName = rawSubtypeName.replace(/_/g, ' '); 

        const fetchDetailedResult = async () => {
            setLoading(true);
            let mbtiDetails = {};
            let subtypeDetails = {};
            let hasError = false;

            // 1. MBTI 상세 정보 GET 요청 (MBTI는 코드 그대로 사용)
            try {
                const mbtiResponse = await fetch(`${BASE_URL}/api/mbti/${mbtiName}`); 
                if (!mbtiResponse.ok) throw new Error(`MBTI (${mbtiName}) 상세 정보 로드 실패`);
                
                const data = await mbtiResponse.json();
                mbtiDetails = data.data || data;
                
            } catch (err) {
                console.error("MBTI 상세 GET 오류:", err);
                hasError = true;
                mbtiDetails = { summary: `MBTI 상세 정보 로드 오류: ${err.message}`, instruction: "MBTI 상세 설명을 가져올 수 없습니다.", img_url: 'https://via.placeholder.com/300x300?text=MBTI+Error' };
            }

            // 2. Subtype 상세 정보 GET 요청 (띄어쓰기로 변환된 이름 사용)
            try {
                // ⭐️ Subtype 이름(띄어쓰기 포함)을 URL로 인코딩하여 요청 ⭐️
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

            // 3. 모든 데이터를 병합하여 최종 상태 업데이트
            setResultData(prevData => ({
                ...prevData, 
                // MBTI 필드 병합
                mbti_img_url: mbtiDetails.img_url,
                summary: mbtiDetails.summary,
                mbti_instruction: mbtiDetails.instruction, 

                // Subtype 필드 병합
                subtype_img_url: subtypeDetails.img_url,
                subtype_name_detail: subtypeDetails.type, 
                instruction: subtypeDetails.instruction, // Subtype 메인 설명
                analysis_text: subtypeDetails.analysis_text || subtypeDetails.instruction, // 심층 분석 텍스트
                emoji: subtypeDetails.emoji,

                // 오류 상태 저장
                mbti_error: mbtiDetails.summary && mbtiDetails.summary.includes("로드 오류") ? mbtiDetails.summary : undefined,
                subtype_error: subtypeDetails.subtype_error,
            }));
            
            setLoading(false);
        };

        fetchDetailedResult();
    }, [location.state, navigate]);

    // -----------------------------------------------------
    // ⭐️ 로딩 및 에러 처리 ⭐️
    // -----------------------------------------------------

    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '4rem', color: '#8b5cf6' }}>
                <h1 className="main-heading">상세 결과 분석 중...</h1>
                <p>MBTI 및 서브타입 상세 정보를 불러오고 있습니다. (2회 GET 요청 중)</p>
            </div>
        );
    }
    
    if (error) { 
        console.error(error);
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


    // -----------------------------------------------------
    // ⭐️ 데이터 추출 (병합된 최종 resultData 사용) ⭐️
    // -----------------------------------------------------
    
    const type = resultData?.mbti || "분석 불가"; 
    const scores = resultData?.scores;
    
    // Subtype 추출: POST 응답의 code와 GET 응답의 name 사용
    const subtypeCode = resultData?.subtype?.[0]; 
    const subtypeName = resultData?.subtype_name_detail || subtypeCode?.replace(/_/g, ' ') || "Subtype 분석 불가"; 

    // ⚠️ MBTI 상세 정보
    const summary = resultData?.summary || "MBTI 유형 상세 요약(summary)이 포함되지 않았습니다.";
    const mbtiDescription = resultData?.mbti_instruction || "MBTI 상세 설명(mbti_instruction)이 포함되지 않았습니다.";
    const mbtiImageUrl = resultData?.mbti_img_url || 'https://via.placeholder.com/300x300?text=MBTI+Image';
    
    // ⚠️ Subtype 상세 정보
    const subtypeMainDescription = resultData?.instruction || ""; // 메인 설명은 빈 문자열로 설정하여 출력하지 않음
    const subtypeAnalysisText = resultData?.analysis_text || resultData?.instruction || "서브타입 심층 분석 내용이 포함되지 않았습니다."; // instruction 전체 내용을 이곳에만 출력
    
    const subtypeEmoji = resultData?.emoji || "⭐";
    const subtypeImageUrl = resultData?.subtype_img_url || 'https://via.placeholder.com/200x200?text=Subtype+Image';
    
    // 에러 메시지
    const mbtiError = resultData?.mbti_error;
    const subtypeError = resultData?.subtype_error;

    
    return (
        <div ref={resultRef} className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: '900px', background: '#f9fafb' }}>
            <h1 className="main-heading" style={{ fontSize: '3rem', textAlign: 'center' }}>
                당신의 트렌드 MBTI 결과는?
            </h1>
            
            {/* MBTI 에러 메시지 */}
            {mbtiError && (
                <div style={{ padding: '1rem', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '8px', marginBottom: '1rem' }}>
                    {mbtiError}
                </div>
            )}
            
            {/* 1. MBTI 결과 (Type) 및 이미지 */}
            <Card className="card-container" style={{ padding: '3rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#8b5cf6' }}>
                    MBTI 유형: {type}
                </h2>
                
                {/* 🎯 MBTI 이미지 출력 */}
                <img 
                    src={mbtiImageUrl} 
                    alt={`${type} 결과 이미지`} 
                    style={{ 
                        width: '100%', 
                        maxWidth: '300px', 
                        height: 'auto', 
                        margin: '1rem auto 0.5rem auto',
                        borderRadius: '10px',
                        objectFit: 'cover'
                    }}
                />
                
                {/* ⭐️ 이미지 저장 버튼 영역 ⭐️ */}
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


            {/* 3. MBTI 지표 점수 분석 (Progress Bars) */}
            <Card className="card-container" style={{ padding: '2rem', textAlign: 'left', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#4b5563' }}>
                    MBTI 지표 점수 분석
                </h3>

                {scores ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* E-I 지표 (E 점수만 사용) */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>외향 (E)</span>
                                <span>내향 (I)</span>
                            </div>
                            <Progress value={getDimensionPercentage(scores.E)} className="progress-bar-track" />
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                                외향 점수: {scores.E} (총점 48점 중)
                            </p>
                        </div>
                        
                        {/* S-N 지표 (S 점수만 사용) */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>감각 (S)</span>
                                <span>직관 (N)</span>
                            </div>
                            <Progress value={getDimensionPercentage(scores.S)} className="progress-bar-track" />
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                                감각 점수: {scores.S} (총점 48점 중)
                            </p>
                        </div>

                        {/* T-F 지표 (T 점수만 사용) */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>사고 (T)</span>
                                <span>감정 (F)</span>
                            </div>
                            <Progress value={getDimensionPercentage(scores.T)} className="progress-bar-track" />
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                                사고 점수: {scores.T} (총점 48점 중)
                            </p>
                        </div>

                        {/* J-P 지표 (J 점수만 사용) */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <span>판단 (J)</span>
                                <span>인식 (P)</span>
                            </div>
                            <Progress value={getDimensionPercentage(scores.J)} className="progress-bar-track" />
                            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'center' }}>
                                판단 점수: {scores.J} (총점 48점 중)
                            </p>
                        </div>

                    </div>
                ) : (
                    <p style={{ textAlign: 'center', color: '#ef4444' }}>점수 정보가 서버 응답에 포함되지 않았습니다.</p>
                )}
            </Card>

            {/* 2. MBTI 전체 설명 */}
            <Card className="card-container" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'left', border: '2px solid #8b5cf6' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#8b5cf6' }}>
                    MBTI 유형 상세 해석: {summary}
                </h3>
                <p style={{ fontSize: '1rem', color: '#374151', lineHeight: '1.6' }}>
                    {mbtiDescription}
                </p>
            </Card>
            
            
            {/* 4. Subtype 결과, 이미지 및 분석 */}
            {subtypeCode && (
                <Card className="card-container" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'left', border: '2px solid #a78bfa' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {subtypeEmoji} 서브타입 분석: {subtypeName}
                    </h3>
                    
                    {subtypeError && (
                        <div style={{ padding: '0.5rem', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '4px', marginBottom: '1rem' }}>
                            {subtypeError}
                        </div>
                    )}
                    
                    {/* 🎯 Subtype 메인 설명: 이 섹션을 완전히 제거하여 이미지 위에 설명이 출력되지 않도록 함 */}
                    
                    {/* 🎯 서브타입 이미지 출력 */}
                    {subtypeImageUrl && (
                        <img 
                            src={subtypeImageUrl} 
                            alt={`${subtypeName} 서브타입 이미지`} 
                            style={{ 
                                width: '100%', 
                                maxWidth: '200px', 
                                height: 'auto', 
                                margin: '0.5rem auto 1.5rem auto', // 마진 조정
                                borderRadius: '10px',
                                objectFit: 'cover'
                            }}
                        />
                    )}

                    
                    {/* 🎯 서브타입 심층 분석 */}
                    <div style={{ marginTop: '0.5rem', textAlign: 'left' }}>
                        <h4 style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '0.5rem' }}>심층 분석</h4>
                         <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: '1.4' }}>
                            {subtypeAnalysisText} {/* instruction 전체 내용을 이곳에 한 번만 출력 */}
                        </p>
                    </div>
                </Card>
            )}


            {/* Navigation Buttons (홈/재검사 버튼) */}
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