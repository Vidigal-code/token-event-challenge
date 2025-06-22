import { HashRouter, Routes, Route } from 'react-router-dom';
import Renderphotos from "./renderphotos/renderphotos.tsx";
import Renderpreview from "./renderpreview/Renderpreview.tsx";
import LoginPhotos from './page/login/LoginPhotos.tsx';
import RegisterPhotos from './page/register/RegisterPhotos.tsx';
import PanelUserOrAdminPhotos from './page/panel/PanelUserOrAdminPhotos.tsx';

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Renderphotos />} />
                <Route path="/preview" element={<Renderpreview />} />
                <Route path="/login" element={<LoginPhotos />} />
                <Route path="/register" element={<RegisterPhotos />} />
                <Route path="/panel" element={<PanelUserOrAdminPhotos />} />
            </Routes>
        </HashRouter>
    );
}

export default App;