// src/components/ui/progress.js

import React from 'react';

export function Progress({ value = 0, className = "" }) {
  // value는 0에서 100 사이의 값
  const widthStyle = { width: `${value}%` };
  
  const trackStyle = {
    position: 'relative',
    height: '0.5rem', /* h-2 */
    width: '100%',
    overflow: 'hidden',
    borderRadius: '9999px', /* rounded-full */
    backgroundColor: '#e5e7eb', /* bg-secondary (매우 연한 회색) */
  };
  
  const indicatorStyle = {
    height: '100%',
    transition: 'width 0.6s ease-in-out',
    backgroundColor: '#8b5cf6', /* bg-purple-600 */
    ...widthStyle,
  };

  return (
    <div 
      style={trackStyle}
      className={className} /* 외부에서 전달된 클래스는 유지 */
    >
      <div
        style={indicatorStyle}
      />
    </div>
  );
}