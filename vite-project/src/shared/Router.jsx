// src/shared/Router.jsx (수정된 전체 코드)

import React, { useState }from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from '../pages/MainPage.jsx';
import Result from '../pages/Result.jsx';
import Test from '../pages/Test.jsx';
import ShowAllTypePage from '../pages/ShowAllTypePage.jsx';
import Layout from './layout.jsx';

const Router = () => {
    // 1. ⚛️ 최종 결과 객체 대신, 결과 조회에 사용할 ID만 저장합니다.
    const [resultId, setResultId] = useState(null); 

    // 2. 📝 Test.js에서 백엔드가 응답한 객체(ID 포함)를 받아 ID만 추출하여 저장합니다.
    const handleTestComplete = (resultData) => { 
        // 백엔드 응답 객체에서 ID를 추출한다고 가정
        setResultId(resultData.id); 
        console.log("백엔드로부터 받은 결과 ID:", resultData.id);
    };

    return (
            <Layout>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    
                    {/* Test 컴포넌트에 정의된 함수를 props로 전달 */}
                    <Route 
                        path="test" 
                        element={<Test onComplete={handleTestComplete} />} 
                    />
                    
                    {/* 3. Result 컴포넌트에 결과 ID를 props로 전달 */}
                    <Route 
                        path="result" 
                        element={<Result resultId={resultId} />} 
                    />
                    
                    <Route path="showAllTypePage" element={<ShowAllTypePage />} />
                </Routes>
            </Layout>

    );
};

export default Router;