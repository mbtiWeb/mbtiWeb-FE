// src/shared/Layout.js

import React from 'react';
import Header from '../components/ui/header';

const layoutStyles = {
    minHeight: '80vh', // Header와 Footer를 제외한 본문 영역 높이
    padding: '20px',
};

function Layout({ children }) {
    return (
        <div>
            <Header />
                <div style={{ ...layoutStyles }}>{children}</div>
        </div>
    );
}

export default Layout;