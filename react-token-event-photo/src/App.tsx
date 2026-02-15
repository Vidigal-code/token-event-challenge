import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import RenderPhotos from "./renderphotos/RenderPhotos.tsx";
import LoginPhotos from './page/login/LoginPhotos.tsx';
import RegisterPhotos from './page/register/RegisterPhotos.tsx';
import PanelUserOrAdminPhotos from './page/panel/PanelUserOrAdminPhotos.tsx';
import RenderPreview from "./renderpreview/RenderPreview.tsx";
import { useAppSelector } from './app/store/hooks';

const AppLoading = () => (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-200 to-gray-400">
        <span className="text-gray-700 font-semibold">Loading session...</span>
    </div>
);

const ProtectedRoute = () => {
    const auth = useAppSelector((state) => state.auth);
    if (!auth.initialized) {
        return <AppLoading />;
    }
    return auth.authenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

const GuestRoute = () => {
    const auth = useAppSelector((state) => state.auth);
    if (!auth.initialized) {
        return <AppLoading />;
    }
    return auth.authenticated ? <Navigate to="/panel" replace /> : <Outlet />;
};

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<RenderPhotos />} />
                <Route path="/preview" element={<RenderPreview />} />
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPhotos />} />
                    <Route path="/register" element={<RegisterPhotos />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                    <Route path="/panel" element={<PanelUserOrAdminPhotos />} />
                </Route>
                <Route path="*" element={<RenderPhotos />} />
            </Routes>
        </HashRouter>
    );
}

export default App;