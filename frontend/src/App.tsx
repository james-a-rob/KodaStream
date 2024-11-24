import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // useLocation for path checking

import Header from './components/Header';
import Home from './pages/Home';
import StudioList from './pages/StudioList';

import Studio from './pages/Studio';
import Media from './pages/Media';
import Preview from './pages/Preview';

import GlobalStyles from './GlobalStyles';

const App: React.FC = () => {
  // Get the current location using the useLocation hook
  const location = useLocation();

  // Hide the header if the route is /preview/:id (i.e., starts with '/preview/')
  const isPreviewPage = location.pathname.startsWith('/preview/');

  return (
    <div>
      <GlobalStyles />
      {/* Conditionally render the Header based on the current path */}
      {!isPreviewPage && <Header title="KodaStream" />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studio" element={<StudioList />} />
        <Route path="/studio/:id" element={<Studio />} />
        <Route path="/studio/preview/:id" element={<Preview />} />
        <Route path="/media" element={<Media />} />
      </Routes>
    </div>
  );
};

export default App;
