import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import { AppProvider } from './context/AppContext';
import ExamPage from './pages/ExamPage';
import FlashcardPage from './pages/FlashcardPage';
import HistoryPage from './pages/HistoryPage';
import Home from './pages/Home';
import ResultsPage from './pages/ResultsPage';

function App() {
    return (
        <AppProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/cert/:certId/flashcards"
                            element={<FlashcardPage />}
                        />
                        <Route
                            path="/cert/:certId/exam"
                            element={<ExamPage />}
                        />
                        <Route
                            path="/cert/:certId/results"
                            element={<ResultsPage />}
                        />
                        <Route
                            path="/cert/:certId/history"
                            element={<HistoryPage />}
                        />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AppProvider>
    );
}

export default App;
