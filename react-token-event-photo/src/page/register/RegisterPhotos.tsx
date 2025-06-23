import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import nexLabLogo from '../../../public/nexlab.png';
import { VITE_API_BACK_END } from '../../api/api.ts';
import type { AuthState, CsrfResponse, LoginResponse } from '../login/interface-login.ts';
import { IoExitOutline } from 'react-icons/io5';

const RegisterPhotos: React.FC = () => {

    /**
     * User's full name state for registration.
     */
    const [name, setName] = useState<string>('Test User');

    /**
     * User's email address state for registration/login.
     */
    const [email, setEmail] = useState<string>('test@example.com');

    /**
     * User's password state for registration/login.
     */
    const [password, setPassword] = useState<string>('TestAAA1#');

    /**
     * CSRF token state to protect against cross-site request forgery.
     */
    const [csrfToken, setCsrfToken] = useState<string | null>(null);

    /**
     * Authentication state including authentication status and user ID.
     */
    const [authState, setAuthState] = useState<AuthState>({ authenticated: false, id: '0' });

    /**
     * Error message state to display any registration or CSRF errors.
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Loading state indicating whether a network request is in progress.
     */
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    /**
     * Fetches CSRF token from backend and sets it in state.
     * Handles errors by logging and setting error state.
     */
    const fetchCsrfToken = useCallback(() => {
        axios
            .get<CsrfResponse>(`${VITE_API_BACK_END}/auth/csrf`, {
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

    /**
     * Handles the user registration form submission.
     * Sends name, email, password, and CSRF token to backend.
     * Updates authentication state and redirects to login on success.
     * Handles errors and loading state.
     *
     * @param e - React form event triggered on form submit.
     */
    const handleRegister = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (!csrfToken) {
                setError('CSRF token is missing. Please refresh the page.');
                return;
            }
            setIsLoading(true);
            setError(null);

            axios
                .post<LoginResponse>(
                    `${VITE_API_BACK_END}/auth/register`,
                    { name, email, password },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': csrfToken,
                        },
                        withCredentials: true,
                    }
                )
                .then((response) => {
                    setAuthState({ authenticated: true, id: response.data.user.id });
                    setCsrfToken(response.data.csrfToken);
                    navigate('/login');
                })
                .catch((error) => {
                    const message =
                        error.response?.data?.message ||
                        error.message ||
                        'An unknown error occurred.';
                    console.error('Registration error:', message);
                    setError(message);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [name, email, password, csrfToken, navigate]
    );

    /**
     * Runs once on component mount to fetch CSRF token.
     */
    useEffect(() => {
        fetchCsrfToken();
    }, [fetchCsrfToken]);


    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 font-sans p-4">
            <div className="w-full max-w-[400px] h-[711px] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex flex-col items-center justify-center flex-grow p-8">
                    <img src={nexLabLogo} alt="NexLab Logo" className="w-[150px] mb-8" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Register</h2>
                    {error && (
                        <div className="w-full bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="text-gray-700 font-medium mb-2">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none
                                focus:ring-2 focus:ring-gray-800"
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="email" className="text-gray-700 font-medium mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none
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
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962
                                        7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                            ) : (
                                'Register'
                            )}
                        </button>
                    </form>
                    <div className="w-full flex flex-col gap-4 mt-3">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center flex-1 px-6
                                    py-3 bg-white text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100
                                    hover:text-gray-900 transition-colors shadow-md"
                            title="Return to Home"
                        >
                            <IoExitOutline className="w-5 h-5 mr-2"/>
                            Return
                        </button>
                    </div>
                    {authState.authenticated && (
                        <p className="mt-4 text-green-600 text-center">
                            Registration successful! Redirecting to login...
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

export default RegisterPhotos;