import { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import InitialScreen from './components/InitialScreen';
import PreCaptureScreen from './components/PreCaptureScreen';
import CountdownScreen from './components/CountdownScreen';
import ReviewScreen from './components/ReviewScreen';
import FinalScreen from './components/FinalScreen';

const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
        img.src = src;
    });
};

const App = () => {

    const [step, setStep] = useState(1);
    const [photo, setPhoto] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const webcamRef = useRef<Webcam | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [countdown, setCountdown] = useState(3);
    const [countdownActive, setCountdownActive] = useState(false);

    const startOver = useCallback(() => {
        setError(null);
        setPhoto(null);
        setIsLoading(false);
        setStep(1);
    }, []);

    const takePhoto = useCallback(async () => {

        if (!webcamRef.current || !canvasRef.current) {
            setError('Webcam or canvas reference is missing. Please try again.');
            startOver();
            return;
        }

        const imageSrc = webcamRef.current.getScreenshot({ width: 1080, height: 1920 });

        if (!imageSrc) {
            setError('Could not capture a screenshot. Please ensure camera permissions are granted and try again.');
            startOver();
            return;
        }


        setIsLoading(true);

        console.log("Captured Base64 Image:", imageSrc.substring(0, 100) + "..."); // TEST 

        try {
            const context = canvasRef.current.getContext('2d');

            if (!context) {
                throw new Error('Failed to get canvas context.');
            }

            const logoSrc = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMTUwIDUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9ImJsYWNrIj48cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHN0cm9rZT0iYmxhY2siIHN0cm9rZVdpZHRoPSIyIiBmaWxsPSJub25lIiAvPjx0ZXh0IHg9IjUiIHk9IjMyIiBmb250RmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udFNpemU9IjE4IiBmb250V2VpZ2h0PSJib2xkIj5ORVg8L3RleHQ+PHRleHQgeD0iNjAiIHk9IjMyIiBmb250RmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udFNpemU9IjI0Ij4ubGFiPC90ZXh0Pjwvc3ZnPg==';

            const [loadedImage, loadedLogo] = await Promise.all([
                loadImage(imageSrc),
                loadImage(logoSrc)
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
            context.fillText('we make tech simple_', canvas.width - 50, 95);
            context.textAlign = 'center';
            context.fillText('we make tech simple_', canvas.width / 2, canvas.height - 40);

            setPhoto(canvas.toDataURL('image/png'));
            setIsLoading(false);
            setStep(4);

        } catch (err) {
            console.error("Error during image processing:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during image processing.');
            setIsLoading(false);
        }
    }, [startOver]);

    useEffect(() => {
        if (!countdownActive) return;
        if (countdown === 0) {
            setCountdownActive(false);
            takePhoto();
            return;
        }
        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdownActive, countdown, takePhoto]);

    const startCapture = () => setStep(2);
    const capturePhoto = () => { setError(null); setStep(3); setCountdown(3); setCountdownActive(true); };
    const retry = () => { setError(null); setStep(2); };

    const approve = () => setStep(5);

    const renderContent = () => {
        if (error) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-8 text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Ocorreu um Erro</h2>
                    <p className="text-gray-700 mb-8">{error}</p>
                    <button
                        onClick={startOver}
                        className="px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition"
                    >
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="animate-spin h-12 w-12 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0
                        12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            );
        }

        switch (step) {
            case 1: return <InitialScreen onStart={startCapture} />;
            case 2: return <PreCaptureScreen webcamRef={webcamRef} onCapture={capturePhoto} />;
            case 3: return <CountdownScreen countdown={countdown} webcamRef={webcamRef} />;
            case 4: return photo && <ReviewScreen photo={photo} onRetry={retry} onApprove={approve} />;
            case 5: return photo && <FinalScreen photo={photo} onFinalize={startOver} />;
            default: return <InitialScreen onStart={startOver} />;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-200 to-gray-400 font-sans p-4">
            <div className="w-[400px] h-[711px] bg-white rounded-xl shadow-2xl overflow-hidden relative flex flex-col">
                {renderContent()}
            </div>
            {step === 5 && (
                <button
                    onClick={startOver}
                    className="w-[400px] mt-4 py-4 bg-gray-800 text-white text-xl font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
                >
                    Finalizar
                </button>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default App;