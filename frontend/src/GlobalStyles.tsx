import React from 'react';
import { Global, css } from '@emotion/react';

const GlobalStyles: React.FC = () => (
    <Global
        styles={css`
            body {
                margin: 0; 
                padding: 0; 
            }
                
        `}
    />
);

export default GlobalStyles;