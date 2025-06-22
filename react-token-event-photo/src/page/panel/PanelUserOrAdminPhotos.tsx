import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import nexLabLogo from '../../../public/nexlab.png';
import { VITE_API_BACK_END } from '../../api/api.ts';
import type { AuthState, CsrfResponse } from '../login/interface-login.ts';
import type {DeleteResponse, ImageResponse, Image } from './interface-panel.ts';
import { FaRegTrashAlt } from "react-icons/fa";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { IoMdExit } from "react-icons/io";



const PanelUserOrAdminPhotos: React.FC = () => {

    const [authState, setAuthState] = useState<AuthState>({ authenticated: false, id: '0' });
    const [images, setImages] = useState<Image[]>([]);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const navigate = useNavigate();

    const fetchCsrfToken = useCallback(() => {
        axios
            .get<CsrfResponse>(`${VITE_API_BACK_END}/auth/csrf`, { withCredentials: true })
            .then((response) => {
                setCsrfToken(response.data.csrfToken);
            })
            .catch((error) => {
                console.error('Error fetching CSRF token:', error);
                setError('Failed to initialize CSRF protection. Please try again.');
            });
    }, []);

    const checkAuth = useCallback(() => {
        axios
            .get<AuthState>(`${VITE_API_BACK_END}/auth/check`, { withCredentials: true })
            .then((response) => {
                setAuthState(response.data);
                if (!response.data.authenticated) {
                    navigate('/login');
                }
            })
            .catch((error) => {
                console.error('Error checking auth:', error);
                setError('Authentication check failed. Please log in.');
                navigate('/login');
            });
    }, [navigate]);

    const fetchImages = useCallback(() => {
        setIsLoading(true);
        setError(null);

        axios
            .get<ImageResponse>(`${VITE_API_BACK_END}/image/all`, { withCredentials: true })
            .then((response) => {
                setImages(response.data.images);
                setIsAdmin(true);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.response?.status === 403) {
                    axios
                        .get<ImageResponse>(`${VITE_API_BACK_END}/image/user`, { withCredentials: true })
                        .then((response) => {
                            setImages(response.data.images);
                            setIsAdmin(false);
                            setIsLoading(false);
                        })
                        .catch((userError) => {
                            console.error('Error fetching user images:', userError);
                            const message =
                                userError.response?.data?.message || 'Failed to load your images. Please try again.';
                            setError(message);
                            setIsLoading(false);
                        });
                } else {
                    console.error('Error fetching all images:', error);
                    const message =
                        error.response?.data?.message || 'Failed to load images. Please try again.';
                    setError(message);
                    setIsLoading(false);
                }
            });
    }, []);

    const handleDelete = useCallback(
        (qrCodeId: string) => {
            if (!csrfToken) {
                setError('CSRF token is missing. Please refresh the page.');
                return;
            }
            setIsLoading(true);
            setError(null);

            const endpoint = isAdmin
                ? `${VITE_API_BACK_END}/image/qr/${qrCodeId}`
                : `${VITE_API_BACK_END}/image/user/qr/${qrCodeId}`;

            axios
                .delete<DeleteResponse>(endpoint, {
                    headers: {
                        'X-CSRF-Token': csrfToken,
                    },
                    withCredentials: true,
                })
                .then(() => {
                    setImages((prev) => prev.filter((image) => image.qrCodeId !== qrCodeId));
                })
                .catch((error) => {
                    const message =
                        error.response?.data?.message ||
                        error.message ||
                        'Failed to delete image.';
                    console.error('Delete error:', message);
                    setError(message);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        },
        [csrfToken, isAdmin]
    );


    useEffect(() => {
        checkAuth();
        fetchCsrfToken();
        if (authState.authenticated) {
            fetchImages();
        }
    }, [checkAuth, fetchCsrfToken, fetchImages, authState.authenticated]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 font-sans p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex flex-col items-center p-8">
                    <img src={nexLabLogo} alt="NexLab Logo" className="w-[150px] mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {isAdmin ? 'Admin Photo Panel' : 'User Photo Panel'}
                    </h2>
                    <button
                        onClick={() => navigate(`/`)}
                        className="flex items-center text-black hover:text-red-800 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View"
                    >
                        <span>Exit</span>
                        <IoMdExit className="w-5 h-5 ml-2" />
                    </button>

                    {error && (
                        <div className="w-full bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <svg
                                className="animate-spin h-8 w-8 text-gray-700"
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
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </div>
                    ) : images.length === 0 ? (
                        <p className="text-gray-600 text-center">No photos found.</p>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">ID</th>
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">QR Code ID</th>
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">Date</th>
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">Time</th>
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">S3 Bucket</th>
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">S3 Key</th>
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">User ID</th>
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">Delete</th>
                                    <th className="px-4 py-2 text-left text-gray-700 font-medium border-b">View</th>
                                </tr>
                                </thead>
                                <tbody>
                                {images.map((image) => (
                                    <tr key={image.qrCodeId} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border-b text-gray-700">{image.id}</td>
                                        <td className="px-4 py-2 border-b text-gray-700">{image.qrCodeId}</td>
                                        <td className="px-4 py-2 border-b text-gray-700">{image.date}</td>
                                        <td className="px-4 py-2 border-b text-gray-700">{image.time}</td>
                                        <td className="px-4 py-2 border-b text-gray-700">{image.s3Bucket}</td>
                                        <td className="px-4 py-2 border-b text-gray-700">{image.s3Key}</td>
                                        <td className="px-4 py-2 border-b text-gray-700">{image.userId}</td>
                                        <td className="px-4 py-2 border-b">
                                            <button
                                                onClick={() => handleDelete(image.qrCodeId)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                                disabled={isLoading}
                                            >
                                                <FaRegTrashAlt className="h-5 w-5" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <button
                                                onClick={() => navigate(`/preview?qrCodeId=${image.qrCodeId}`)}
                                                className="text-blue-600 hover:text-red-800"
                                                title="View"
                                                disabled={isLoading}
                                            >
                                                <HiMiniViewfinderCircle className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                <div className="w-full p-4 bg-gray-100 text-center text-gray-600">
                    we make tech simple
                </div>
            </div>
        </div>
    );
};

export default PanelUserOrAdminPhotos;