// src/components/ui/card.js

import React from 'react';

const CardBaseStyle = {
    borderRadius: '0.75rem', /* rounded-xl */
    border: '1px solid #e5e7eb', /* border */
    backgroundColor: 'white',
    color: '#1f2937', /* text-card-foreground */
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', /* shadow-sm */
};

export function Card({ className = "", style = {}, ...props }) {
    // className 대신 CardBaseStyle을 기본으로 사용합니다.
    // className prop은 무시됩니다 (혹은 이미 정의된 index.css의 클래스를 사용해야 함).

    const finalStyle = {
        ...CardBaseStyle,
        ...style,
    };

    return (
        <div
            style={finalStyle}
            className={className} /* 외부에서 전달된 클래스는 유지 */
            {...props}
        />
    );
}