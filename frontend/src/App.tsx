import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Home from './pages/Home';
import Studio from './pages/Studio';
import Media from './pages/Media';



import GlobalStyles from './GlobalStyles'

const App: React.FC = () => {
  return (
    <div>
      <GlobalStyles />

      <Header title="KodaStream" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studio/:id" element={<Studio />} />
        <Route path="/media" element={<Media />} />

      </Routes>
    </div>
  );
};

export default App;