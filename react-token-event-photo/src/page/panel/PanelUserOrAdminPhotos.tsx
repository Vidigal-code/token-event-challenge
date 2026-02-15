import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Image } from './interface-panel.ts';
import { FaRegTrashAlt } from "react-icons/fa";
import { HiMiniViewfinderCircle } from "react-icons/hi2";
import { IoMdExit } from "react-icons/io";
import { IoExitOutline } from 'react-icons/io5';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks.ts';
import { logoutSession } from '../../entities/auth/model/auth-slice.ts';
import {
    useAuthSyncHealthQuery,
    useLogoutMutation
} from '../../features/auth/api/auth-queries.ts';
import { useDeleteImageMutation, useImagesQuery } from '../../features/panel/api/panel-queries.ts';
import { useQueryClient } from '@tanstack/react-query';


/**
 * PanelUserOrAdminPhotos Component
 *
 * Displays a photo panel that shows images for either an admin user or a regular user.
 *
 * Features:
 * - Checks user authentication and redirects to login if not authenticated.
 * - Fetches CSRF token for secure API requests.
 * - Loads all images if user is admin; otherwise, loads only the user's images.
 * - Allows deleting images with CSRF protection and proper API endpoints based on user role.
 * - Provides a view button to preview each image.
 * - Handles loading states and displays errors.
 * - Includes navigation controls and branding.
 *
 * Uses React hooks (useState, useEffect, useCallback) for state and side effects.
 * Uses axios for HTTP requests with credentials.
 */
const PanelUserOrAdminPhotos: React.FC = () => {
    /**
     * Holds error messages to display to the user.
     */
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const syncHealthQuery = useAuthSyncHealthQuery(auth.authenticated);
    const logoutMutation = useLogoutMutation();
    const imagesQuery = useImagesQuery(auth.authenticated, auth.user?.id ?? null);
    const isAdmin = imagesQuery.data?.isAdmin ?? false;
    const images: Image[] = imagesQuery.data?.images ?? [];
    const deleteMutation = useDeleteImageMutation(isAdmin);
    const isLoading =
        !auth.initialized ||
        imagesQuery.isLoading ||
        logoutMutation.isPending ||
        deleteMutation.isPending;

    /**
     * Handles deleting an image by its QR code ID.
     * Sends DELETE request to appropriate endpoint based on admin status.
     * Updates images state on success.
     * Handles errors and loading state.
     * @param qrCodeId - The QR code ID of the image to delete.
     */
    const handleDelete = useCallback(
        (qrCodeId: string) => {
            if (!auth.csrfToken) {
                setError('CSRF token is missing. Please refresh the page.');
                return;
            }
            setError(null);

            deleteMutation.mutate(
                { qrCodeId, csrfToken: auth.csrfToken },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['panel', 'images'] });
                    },
                    onError: (error: any) => {
                        const message =
                            error.response?.data?.message ||
                            error.message ||
                            'Failed to delete image.';
                        console.error('Delete error:', message);
                        setError(message);
                    },
                }
            );
        },
        [auth.csrfToken, deleteMutation, queryClient]
    );

    /**
     * Handles user logout by sending a POST request to the backend.
     * Clears auth and CSRF token states and redirects to homepage on success.
     * Handles errors and loading state.
     */
    const handleLogout = useCallback(() => {
        setError(null);

        logoutMutation.mutate(auth.csrfToken ?? null, {
            onSuccess: async () => {
                dispatch(logoutSession());
                queryClient.setQueryData(['auth', 'check'], {
                    authenticated: false,
                    id: '0',
                });
                queryClient.setQueryData(['auth', 'sync-health'], {
                    authenticated: false,
                    id: '0',
                    role: 'unknown',
                    hasAccessTokenCookie: false,
                    hasRefreshTokenCookie: false,
                    hasCsrfCookie: false,
                    synced: false,
                });
                queryClient.removeQueries({ queryKey: ['panel', 'images'] });
                queryClient.invalidateQueries({ queryKey: ['auth', 'csrf'] });
                await queryClient.refetchQueries({ queryKey: ['auth', 'csrf'] });
                navigate('/');
            },
            onError: (error: any) => {
                const message =
                    error.response?.data?.message || error.message || 'Logout failed. Please try again.';
                console.error('Logout error:', message);
                setError(message);
            },
        });
    }, [auth.csrfToken, navigate, dispatch, logoutMutation, queryClient]);

    useEffect(() => {
        if (auth.initialized && !auth.authenticated) {
            navigate('/login');
        }
    }, [auth.initialized, auth.authenticated, navigate]);

    useEffect(() => {
        if (imagesQuery.error) {
            setError('Failed to load images. Please try again.');
        }
    }, [imagesQuery.error]);




    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 font-sans p-4">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex flex-col items-center p-8">
                    <img src="https://raw.githubusercontent.com/Vidigal-code/token-event-challenge/refs/heads/gh-pages/vidigalcode.png" alt="Vidigal Logo" className="w-[150px] mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {isAdmin ? 'Admin Photo Panel' : 'User Photo Panel'}
                    </h2>
                    <div className="flex justify-center gap-4 mb-4">
                        <button
                            onClick={() => {
                                navigate('/');
                            }}
                            className="flex items-center text-black hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Return"
                            disabled={isLoading}
                        >
                            <span>Return</span>
                            <IoExitOutline className="w-5 h-5 ml-2" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-black hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Logout"
                            disabled={isLoading}
                        >
                            <span>Logout</span>
                            <IoMdExit className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                    {error && (
                        <div className="w-full bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
                            {error}
                        </div>
                    )}
                    {syncHealthQuery.data && !syncHealthQuery.data.synced && (
                        <div className="w-full bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-6 text-center">
                            Session is out of sync. Please refresh or login again.
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
                                                onClick={() => {
                                                    handleDelete(image.qrCodeId);
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete"
                                                disabled={isLoading}
                                            >
                                                <FaRegTrashAlt className="h-5 w-5" />
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 border-b">
                                            <button
                                                onClick={() => {
                                                    navigate(`/preview?qrCodeId=${image.qrCodeId}`);
                                                }}
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