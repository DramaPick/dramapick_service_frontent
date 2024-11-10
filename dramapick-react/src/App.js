import './App.css';
import { Route, Routes } from 'react-router-dom';
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import Main from "./pages/Main";
import PSelection from "./pages/PSelection";
import ShortsDown from './pages/ShortsDown';

function App() {
  return (
    <div className="app">
      <Header/>
      <main className="content">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/selection" element={<PSelection />} />
          <Route path="/shorts" element={<ShortsDown />} />
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

export default App;