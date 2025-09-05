import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IoExitOutline } from 'react-icons/io5';
import {getImageById} from "../gitpages/gitpage-config.ts";

const RenderPreview: React.FC = () => {
    /**
     * State holding the URL of the fetched image or null if not loaded.
     */
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    /**
     * State holding any error messages related to image fetching or other operations.
     */
    const [error, setError] = useState<string | null>(null);

    /**
     * Loading state to indicate whether the image is currently being fetched.
     */
    const [isLoading, setIsLoading] = useState(true);

    const location = useLocation();
    const navigate = useNavigate();

    /**
     * Extracts the 'qrCodeId' query parameter from the current URL.
     * @returns {string} The QR code ID or empty string if not found.
     */
    const getQrCodeId = () => {
        const params = new URLSearchParams(location.search);
        return params.get('qrCodeId') || '';
    };

    const qrCodeId = getQrCodeId();

    useEffect(() => {
        if (!qrCodeId) {
            setError('No QR code ID provided.');
            setIsLoading(false);
            return;
        }

        const fetchImage = async () => {
            try {
                const imageData = await getImageById(qrCodeId);
                if (!imageData || !imageData.image) {
                    setError('No photo found for this QR code.');
                    setIsLoading(false);
                    return;
                }
                setImageSrc(imageData.image);
                setIsLoading(false);
            } catch (err: any) {
                console.error('Error fetching image:', err);
                setError('Failed to load photo.');
                setIsLoading(false);
            }
        };

        fetchImage();
    }, [qrCodeId]);

    /**
     * Handles the download of the currently loaded image.
     * Creates a temporary anchor element to trigger the download of the image.
     */
    const handleDownload = () => {
        if (!imageSrc) return;

        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = `photo-${qrCodeId || 'download'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-200">
                <svg
                    className="animate-spin h-12 w-12 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4">
                <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
                <p className="text-gray-700 mb-8 text-center">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
                <div className="flex flex-col items-center p-8">
                    <img src="/vidigalcode.png" alt="Vidigal Code Logo" className="w-[150px] mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Photo Preview</h2>
                    {imageSrc && (
                        <>
                            <img
                                src={imageSrc}
                                alt="Captured photo"
                                className="w-full max-w-[400px] h-auto rounded-lg shadow-lg mb-6"
                            />
                            <div className="flex flex-col sm:flex-row w-full space-y-4 sm:space-y-0 sm:space-x-4">
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-md"
                                >
                                    Download Image
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="flex items-center justify-center flex-1 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors shadow-md"
                                    title="Return to Home"
                                >
                                    <IoExitOutline className="w-5 h-5 mr-2" />
                                    Return
                                </button>
                            </div>
                        </>
                    )}
                </div>
                <div className="w-full p-4 bg-gray-100 text-center text-gray-600 text-sm">
                    we make tech simple
                </div>
            </div>
        </div>
    );
};

export default RenderPreview;