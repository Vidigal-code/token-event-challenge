import { HashRouter, Routes, Route } from 'react-router-dom';
import Renderphotos from "./renderphotos/renderphotos.tsx";
import Renderpreview from "./renderpreview/Renderpreview.tsx";

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Renderphotos />} />
                <Route path="/preview" element={<Renderpreview />} />
            </Routes>
        </HashRouter>
    );
}

export default App;