import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { v4 as uuidv4 } from 'uuid';
import InitialScreen from './components/InitialScreen.tsx';
import PreCaptureScreen from './components/PreCaptureScreen.tsx';
import CountdownScreen from './components/CountdownScreen.tsx';
import ReviewScreen from './components/ReviewScreen.tsx';
import FinalScreen from './components/FinalScreen.tsx';
import nexLabLogo from '../../public/nexlab.png';
import { VITE_API_BACK_END } from '../api/api.ts';
import axios from 'axios';

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
        img.src = src;
    });
};

interface AuthState {
    authenticated: boolean;
    id: string;
}

const RenderPhotos: React.FC = () => {

    const [step, setStep] = useState<number>(1);
    const [photo, setPhoto] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    //const [csrfToken, setCsrfToken] = useState<string | null>(null);

    const [authState, setAuthState] = useState<AuthState>({ authenticated: false, id: '0' });

    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [countdown, setCountdown] = useState<number>(3);
    const [countdownActive, setCountdownActive] = useState<boolean>(false);

    //const [id, setId] = useState<string>('');

    const [qrCodeId, setQrCodeId] = useState<string>('');

    /*const fetchCsrfToken = useCallback(async () => {
        try {
            const response = await fetch(`${VITE_API_BACK_END}/auth/csrf`, {
                method: 'GET',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch CSRF token: ${response.statusText}`);
            }
            const data = await response.json();
            setCsrfToken(data.csrfToken);
        } catch (err) {
            console.error('Error fetching CSRF token:', err);
            setError('Failed to initialize CSRF protection. Please try again.');
        }
    }, []);*/

    const checkAuth = useCallback(() => {
        axios.get(`${VITE_API_BACK_END}/auth/check`, {
            withCredentials: true
        })
            .then((response) => {
                setAuthState(response.data);
                //console.log(response.data.id);
            })
            .catch((err) => {
                console.error('Error checking authentication:', err);
                setAuthState({ authenticated: false, id: '0' });
            });
    }, []);

   /* useEffect(() => {
        fetchCsrfToken();
        checkAuth();
    }, [fetchCsrfToken, checkAuth]);*/



    const startOver = useCallback(() => {
        setError(null);
        setPhoto(null);
        setIsLoading(false);
        setStep(1);
        //setId('');
        setQrCodeId('');
        setCountdown(3);
        setCountdownActive(false);
    }, []);


    const takePhoto = useCallback(async () => {

        if (!webcamRef.current || !canvasRef.current) {
            setError('Webcam or canvas reference is missing. Please try again.');
            startOver();
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot({ width: 1080, height: 1920 });

        if (!imageSrc) {
            setError('Could not capture a screenshot. Please ensure camera permissions are granted.');
            startOver();
            return;
        }

        setIsLoading(true);

        try {
            const context = canvasRef.current.getContext('2d');
            if (!context) throw new Error('Failed to get canvas context.');

            const [loadedImage, loadedLogo] = await Promise.all([
                loadImage(imageSrc),
                loadImage(nexLabLogo),
            ]);

            const canvas = canvasRef.current;
            canvas.width = 1080;
            canvas.height = 1920;

            context.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);
            context.fillStyle = 'rgba(255, 255, 255, 0.9)';
            context.fillRect(0, 0, canvas.width, 150);
            context.fillRect(0, canvas.height - 100, canvas.width, 100);

            context.drawImage(loadedLogo, 50, 40, 250, 83);
            context.font = '40px Arial';
            context.fillStyle = '#374151';
            context.textAlign = 'right';
            context.fillText('we make tech simple', canvas.width - 50, 95);
            context.textAlign = 'center';
            context.fillText('we make tech simple', canvas.width / 2, canvas.height - 40);

            const photoData = canvas.toDataURL('image/png');
            setPhoto(photoData);

            const newQrCodeId = uuidv4();
            setQrCodeId(newQrCodeId);

            setIsLoading(false);
            setStep(4);
        } catch (err: any) {
            console.error('Error during image processing:', err);
            const message = err?.response?.data?.message || err.message || 'An unknown error occurred.';
            setError(message);
            setIsLoading(false);
            setStep(4);
        }

    }, [startOver, authState.id]);


    const startCapture = useCallback(() => setStep(2), []);

    const capturePhoto = useCallback(() => {
        setError(null);
        setStep(3);
        setCountdown(3);
        setCountdownActive(true);
    }, []);

    const retry = useCallback(() => {
        setError(null);
        setPhoto(null);
        setStep(2);
    }, []);

    const approve = useCallback(async (): Promise<void> => {
        if (!photo) {
            setError('Photo data is missing. Please try again.');
            setStep(4);
            return;
        }

        if (!qrCodeId) {
            setError('QR Code ID is missing. Please retake the photo.');
            setStep(4);
            return;
        }

        try {
            const newId = uuidv4();

            const now = new Date();
            const date = now.toISOString().split('T')[0];
            const time = now.toTimeString().split(' ')[0];

            await axios.post(
                `${VITE_API_BACK_END}/image`,
                {
                    id: newId,
                    base64: photo,
                    qrCodeId,
                    date,
                    time,
                    userId: authState.id,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    withCredentials: true,
                }
            );

            setStep(5);
        } catch (err: unknown) {
            console.error('Error upload image:', err);
            const message =
                axios.isAxiosError(err) && err.response?.data?.message
                    ? err.response.data.message
                    : err instanceof Error
                        ? err.message
                        : 'An unknown error occurred.';
            setError(message);
            setIsLoading(false);
            setStep(4);
        }
    }, [photo, qrCodeId, authState.id]);

    const renderContent = () => {
        if (error) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Ocorreu um Erro</h2>
                    <p className="text-gray-700 mb-8">{error}</p>
                    <button
                        onClick={startOver}
                        className="px-8 py-3 bg-gray-800 text-white
                        font-semibold rounded-lg hover:bg-gray-900 transition"
                    >
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0
                            3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </div>
            );
        }

        switch (step) {
            case 1:
                return <InitialScreen onStart={startCapture} />;
            case 2:
                return <PreCaptureScreen webcamRef={webcamRef} onCapture={capturePhoto} />;
            case 3:
                return <CountdownScreen countdown={countdown} webcamRef={webcamRef} />;
            case 4:
                return photo && <ReviewScreen photo={photo} onRetry={retry} onApprove={approve} />;
            case 5:
                return (
                    photo &&
                    qrCodeId && (
                        <FinalScreen
                            photo={photo}
                            qrCodeId={qrCodeId}
                            onFinalize={startOver}
                        />
                    )
                );
            default:
                return <InitialScreen onStart={startCapture} />;
        }
    };


    useEffect(() => {
        checkAuth();

        if (!countdownActive) return;

        if (countdown === 0) {
            setCountdownActive(false);
            takePhoto();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [checkAuth, countdownActive, countdown, takePhoto]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br
         from-gray-200 to-gray-400 font-sans p-4">
            <div className="w-full max-w-[400px] h-[711px] bg-white rounded-xl shadow-2xl
            overflow-hidden relative flex flex-col">
                {renderContent()}
            </div>
            {step === 5 && (
                <button
                    onClick={startOver}
                    className="w-full max-w-[400px] mt-4 py-4 bg-gray-800 text-white text-xl
                    font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
                >
                    Finalizar
                </button>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default RenderPhotos;