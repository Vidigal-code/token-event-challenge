import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import nexLabLogo from '../../../public/nexlab.png';
import { VITE_API_BACK_END } from '../../api/api.ts';
import axios from 'axios';
import type {AuthState, CsrfResponse, LoginResponse } from './interface-login.ts';
import { IoMdExit } from 'react-icons/io';

const LoginPhotos: React.FC = () => {

    const [email, setEmail] = useState<string>('test@example.com');
    const [password, setPassword] = useState<string>('TestAAA1#');
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [authState, setAuthState] = useState<AuthState>({ authenticated: false, id: '0' });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchCsrfToken = useCallback(() => {
        axios.get<CsrfResponse>(`${VITE_API_BACK_END}/auth/csrf`, {
            withCredentials: true,
        })
            .then((response) => {
                setCsrfToken(response.data.csrfToken);
            })
            .catch((error) => {
                console.error('Error fetching CSRF token:', error);
                setError('Failed to initialize CSRF protection. Please try again.');
            });
    }, []);


    const handleLogin = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (!csrfToken) {
            setError('CSRF token is missing. Please refresh the page.');
            return;
        }

        setIsLoading(true);
        setError(null);

        axios.post<LoginResponse>(
            `${VITE_API_BACK_END}/auth/login`,
            { email, password },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken,
                },
                withCredentials: true,
            }
        )
            .then(response => {
                setAuthState({ authenticated: true, id: response.data.user.id });
                setCsrfToken(response.data.csrfToken);
                navigate('/panel');
            })
            .catch(error => {
                const message =
                    error.response?.data?.message ||
                    error.message ||
                    'An unknown error occurred.';
                console.error('Login error:', message);
                setError(message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [email, password, csrfToken, navigate]);


    useEffect(() => {
        fetchCsrfToken();
    }, [fetchCsrfToken]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br
         from-gray-200 to-gray-400 font-sans p-4">
            <div className="w-full max-w-[400px] h-[711px] bg-white
             rounded-xl
            shadow-2xl overflow-hidden flex flex-col">
                <div className="flex flex-col items-center justify-center flex-grow p-8">
                    <img src={nexLabLogo} alt="NexLab Logo" className="w-[150px] mb-8" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Login</h2>
                    <button
                        onClick={() => navigate(`/`)}
                        className="flex items-center text-black
                        hover:text-red-800 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View"
                    >
                        <span>Exit</span>
                        <IoMdExit className="w-5 h-5 ml-2" />
                    </button>
                    {error && (
                        <div className="w-full bg-red-100
                        text-red-700 p-4 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-gray-700 font-medium mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border
                                 border-gray-300 rounded-lg focus:outline-none
                                focus:ring-2 focus:ring-gray-800"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="password" className="text-gray-700 font-medium mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-gray-800"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !csrfToken}
                            className={`w-full py-3 mt-4 text-white font-semibold rounded-lg transition ${
                                isLoading || !csrfToken
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gray-800 hover:bg-gray-900'
                            }`}
                        >
                            {isLoading ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-white mx-auto"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0
                                         12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>
                    {authState.authenticated && (
                        <p className="mt-4 text-green-600 text-center">
                            Login successful! Redirecting...
                        </p>
                    )}
                </div>
                <div className="w-full p-4 bg-gray-100 text-center text-gray-600">
                    we make tech simple
                </div>
            </div>
        </div>
    );
};

export default LoginPhotos;