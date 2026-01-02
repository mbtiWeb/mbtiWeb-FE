// src/pages/Test.jsx (최종 수정: POST 결과 state 전달)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { Progress } from '../components/Progress.jsx';
import "../components/Header.css";
import "../components/Header.jsx";

// 🎯 실제 백엔드 기본 URL 정의
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 답변 선택지 데이터
const answerOptions = [
    { value: -3, label: '전혀 아니다', colorClass: 'red' },
    { value: -2, label: '아니다', colorClass: 'orange' },
    { value: -1, label: '약간 아니다', colorClass: 'yellow' },
    { value: 0, label: '보통이다', colorClass: 'gray' },
    { value: 1, label: '약간 그렇다', colorClass: 'lime' },
    { value: 2, label: '그렇다', 'colorClass': 'green' },
    { value: 3, label: '매우 그렇다', 'colorClass': 'emerald' },
];

const questionsPerPage = 10;

// ⚠️ 임시 토큰 정의 (실제로는 서버 GET 응답의 token을 사용해야 함)
const DUMMY_TOKEN = 'JvAq4AYd5t9vPvL9HVkj-57PUQLQLAbDfBdgv0QrmWU';


const Test = ({ onComplete }) => {
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState([]); // { questionId: number, score: -3~3 }

    const totalQuestions = questions.length;
    const totalPages = Math.ceil(totalQuestions / questionsPerPage);

    const startIdx = currentPage * questionsPerPage;
    const endIdx = Math.min(startIdx + questionsPerPage, totalQuestions);
    const currentQuestions = questions.slice(startIdx, endIdx);

    const answeredOnCurrentPage = currentQuestions.filter(q =>
        answers.some(a => a.questionId === q.number)
    ).length;

    const answeredTotalCount = answers.length;
    const totalProgress = totalQuestions > 0 ? (answeredTotalCount / totalQuestions) * 100 : 0;

    const isPageComplete = answeredOnCurrentPage === currentQuestions.length;

    // GET 요청: 질문 데이터 가져오기 (이 부분은 수정 없음)
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/question/all`);

                if (!response.ok) {
                    throw new Error('질문 데이터를 불러오는 데 실패했습니다.');
                }

                const data = await response.json();

                const questionList = Array.isArray(data.questionList)
                    ? data.questionList
                    : Array.isArray(data.data)
                        ? data.data
                        : Array.isArray(data)
                            ? data
                            : [];

                setQuestions(questionList);
                setLoading(false);
            } catch (err) {
                setError(`데이터 로드 오류: ${err.message}`);
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleAnswer = (questionId, score) => {
        const newAnswers = answers.filter(a => a.questionId !== questionId);
        newAnswers.push({ questionId, score });
        setAnswers(newAnswers);
    };

    // 🚀 수정된 부분: POST 후 resultData를 state로 전달
    const handleSubmit = async () => {
        if (answers.length !== totalQuestions) {
            alert("모든 질문에 답변해주세요!");
            return;
        }

        // 1. 답변 형식 변환 및 점수 조정 (-3~3을 1~7로)
        const formattedAnswers = answers
            .map(answer => ({
                number: answer.questionId,
                selectedScore: answer.score + 4,
            }))
            .sort((a, b) => a.number - b.number);

        // 2. 최종 POST 데이터 객체 생성
        const postData = {
            answers: formattedAnswers,
            token: DUMMY_TOKEN, // 임시 토큰 사용
        };

        try {
            const response = await fetch(`${BASE_URL}/api/mbti/result`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error('답변 제출에 실패했습니다.');
            }

            const resultData = await response.json();

            // ⭐️ 핵심 수정 ⭐️: POST 응답 데이터를 navigate의 state로 전달
            navigate(`/result`, {
                state: { resultData: resultData }
            });

        } catch (err) {
            setError(err.message);
            alert(`테스트 제출 중 오류 발생: ${err.message}`);
        }
    };

    const handleNext = () => {
        if (currentPage === totalPages - 1) {
            handleSubmit();
        } else if (isPageComplete) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentPage(prev => prev - 1);
    };

    // ... (이하 로딩, 에러, 질문 0개 처리)
    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h2 style={{ color:  '#8b5cf6', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 'bold' }}>질문 목록을 불러오는 중...</h2>
                <p style={{ color: '#6b7280' }}>서버와 연결 중입니다. 잠시만 기다려주세요.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h1 style={{ color: '#ef4444' }}>⚠️ 오류 발생!</h1>
                <Button onClick={() => window.location.reload()} variant="primary" size="lg" style={{ marginTop: '1rem' }}>
                    새로고침
                </Button>
            </div>
        );
    }

    if (totalQuestions === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <h1 style={{ color: '#ef4444' }}>⚠️ 질문 데이터 없음!</h1>
                <p style={{ color: '#374151', marginBottom: '1.5rem' }}>
                    서버에서 질문 목록을 가져왔지만, 배열이 비어있습니다.
                </p>
                <p style={{ color: '#6b7280' }}>
                    백엔드 DB의 question 테이블에 데이터가 있는지 확인해주세요.
                </p>
                <Button onClick={() => window.location.reload()} variant="primary" size="lg" style={{ marginTop: '1rem' }}>
                    새로고침
                </Button>
            </div>
        );
    }


    return (
        <div className="container" style={{ paddingBottom: '3rem', maxWidth: '800px' }}>

            {/* Progress Header */}
            <div className="progress-container">
                <h2 className="progress-header">MBTI 테스트</h2>
                <div className="progress-text-sm">
                    진행률: {answeredTotalCount} / {totalQuestions} ({Math.round(totalProgress)}%)
                </div>
                <Progress value={totalProgress} className="progress-bar-track" />
            </div>

            {/* Questions Card */}
            <Card className="card-container">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {currentQuestions.map((q, index) => {
                        const questionText = q.question;
                        const questionId = q.number;

                        const currentAnswer = answers.find(a => a.questionId === questionId);
                        const questionNumber = startIdx + index + 1;

                        return (
                            <div key={questionId} className="question-item">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <div className="question-number-wrapper" style={{ flexShrink: 0, margin: 0 }}>
                                        <span className="question-number-badge">{questionNumber}</span>
                                    </div>
                                    <p className="question-text" style={{ textAlign: 'left', margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>
                                        {questionText}
                                    </p>
                                </div>

                                <div className="answer-options-wrapper">
                                    <span className="answer-label">전혀<br/>아니다</span>
                                    <div className="answer-buttons-group">
                                        {answerOptions.map(option => {
                                            const isSelected = currentAnswer && currentAnswer.score === option.value;

                                            return (
                                                <button
                                                    key={option.value}
                                                    className={`answer-button ${option.colorClass} ${isSelected ? 'is-selected' : ''}`}
                                                    onClick={() => handleAnswer(questionId, option.value)}
                                                    aria-label={option.label}
                                                >
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="answer-label">매우<br/>그렇다</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Navigation Buttons */}
            <div className="nav-buttons-wrapper">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentPage === 0}
                    style={{ border: '2px solid #e5e7eb' }}
                    className={currentPage === 0 ? 'button-disabled' : ''}
                >
                    <span style={{ marginRight: '0.25rem', width: '1rem', height: '1rem' }}>←</span>
                    이전
                </Button>

                <div className="nav-info-text">
                    {!isPageComplete && `${currentQuestions.length - answeredOnCurrentPage}개 질문이 남았습니다`}
                </div>

                <Button
                    onClick={handleNext}
                    disabled={!isPageComplete}
                    style={{
                        background: 'linear-gradient(to right, #8b5cf6, #ec4899, #3b82f6)',
                        color: 'white',
                        border: 'none',
                    }}
                    className={!isPageComplete ? 'button-disabled' : ''}
                >
                    {currentPage === totalPages - 1 ? '결과 보기' : '다음'}
                    <span style={{ marginLeft: '0.25rem', width: '1rem', height: '1rem' }}>→</span>
                </Button>
            </div>
        </div>
    );
};

export default Test;