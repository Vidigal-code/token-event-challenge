import { HashRouter, Routes, Route } from 'react-router-dom';
import RenderPhotos from "./renderphotos/RenderPhotos.tsx";
import LoginPhotos from './page/login/LoginPhotos.tsx';
import RegisterPhotos from './page/register/RegisterPhotos.tsx';
import PanelUserOrAdminPhotos from './page/panel/PanelUserOrAdminPhotos.tsx';
import RenderPreview from "./renderpreview/RenderPreview.tsx";

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<RenderPhotos />} />
                <Route path="/preview" element={<RenderPreview />} />
                <Route path="/login" element={<LoginPhotos />} />
                <Route path="/register" element={<RegisterPhotos />} />
                <Route path="/panel" element={<PanelUserOrAdminPhotos />} />
                <Route path="*" element={<RenderPhotos />} />
            </Routes>
        </HashRouter>
    );
}

export default App;