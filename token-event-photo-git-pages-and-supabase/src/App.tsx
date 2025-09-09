import { HashRouter, Routes, Route } from 'react-router-dom';
import RenderPhotos from "./renderphotos/RenderPhotos.tsx";
import RenderPreview from "./renderpreview/RenderPreview.tsx";

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<RenderPhotos />} />
                <Route path="/preview" element={<RenderPreview />} />
                <Route path="*" element={<RenderPhotos />} />
            </Routes>
        </HashRouter>
    );
}

export default App;