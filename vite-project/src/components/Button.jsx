// src/components/ui/button.js (최종 수정 버전)

import React from 'react';

// 스타일 객체를 사용하여 기본 스타일 정의 (주요 변형은 인라인 스타일로 오버라이드)
const ButtonBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.375rem', /* rounded-md */
    fontSize: '0.875rem', /* text-sm */
    fontWeight: '500', /* font-medium */
    transition: 'all 0.2s', /* transition-colors */
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 0 0 2px transparent',
    height: '2.5rem', /* h-10 */
    padding: '0 1rem', /* px-4 py-2 */
    // 기본 variant 스타일
    backgroundColor: '#8b5cf6', /* bg-purple-600 */
    color: 'white',
    border: 'none',
};

export function Button({
                           className = "",
                           variant = 'default',
                           size = 'md',
                           style = {}, /* 인라인 스타일을 위한 prop */
                           ...props
                       }) {
    let currentStyle = { ...ButtonBaseStyle };

    // variant에 따른 스타일 오버라이드
    if (variant === 'outline') {
        currentStyle = {
            ...currentStyle,
            backgroundColor: 'white',
            border: '1px solid #d1d5db', /* border-gray-300 */
            color: '#4b5563', /* gray-700 */
        };
    } else if (variant === 'ghost') {
        currentStyle = {
            ...currentStyle,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#4b5563',
        };
    } else if (variant === 'link') {
        currentStyle = {
            ...currentStyle,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#8b5cf6',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
        };
    }

    // size에 따른 스타일 오버라이드
    if (size === 'lg') {
        currentStyle = { ...currentStyle, height: '2.75rem', padding: '0 2rem' }; /* h-11 px-8 */
    } else if (size === 'sm') {
        currentStyle = { ...currentStyle, height: '2.25rem', padding: '0 0.75rem' }; /* h-9 px-3 */
    }

    // hover 및 disabled 스타일은 .index.css에서 처리합니다.
    // 인라인 style prop으로 전달된 스타일은 마지막에 적용하여 오버라이드
    currentStyle = { ...currentStyle, ...style };

    return (
        <button
            className={className} /* 외부에서 전달된 클래스 유지 (예: button-disabled) */
            style={currentStyle}
            {...props}
        />
    );
}