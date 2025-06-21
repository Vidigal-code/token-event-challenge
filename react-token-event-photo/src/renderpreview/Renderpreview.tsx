import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';

const Renderpreview = () => {

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    const getQrCodeId = () => {
        const params = new URLSearchParams(location.search);
        return params.get('qrCodeId') || '';
    };

    const qrCodeId = getQrCodeId();
    const qrCodeUrl = qrCodeId ? `http://localhost:3000/image/qr/${qrCodeId}` : '';

    useEffect(() => {
        if (!qrCodeId) {
            setError('No QR code ID provided in the URL.');
            setIsLoading(false);
            return;
        }

        const fetchImage = async () => {
            try {
                const response = await fetch(qrCodeUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch image: ${response.statusText}`);
                }

                const data = await response.json();
                if (!data.base64) {
                    throw new Error('No image data returned from the server.');
                }

                setImageSrc(data.base64);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching image:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching the image.');
                setIsLoading(false);
            }
        };

        fetchImage();
    }, [qrCodeId, qrCodeUrl]);

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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
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
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-200 p-4">
            <div className="max-w-md w-full flex flex-col items-center">
                {imageSrc && (
                    <>
                        <img
                            src={imageSrc}
                            alt="Captured photo"
                            className="w-full max-w-[400px] h-auto rounded-lg shadow-lg mb-4"
                        />
                        <button
                            onClick={handleDownload}
                            className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition"
                        >
                            Download Image
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Renderpreview;