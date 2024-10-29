import './App.css';
import { Route, Routes } from 'react-router-dom';
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import Main from "./pages/Main";
import PSelection from "./pages/PSelection";

function App() {
  return (
    <div className="app">
      <Header/>
      <main className="content">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/selection" element={<PSelection />} />
        </Routes>
      </main>
      <Footer/>
    </div>
  );
}

export default App;
