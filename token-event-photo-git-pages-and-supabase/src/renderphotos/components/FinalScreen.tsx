import { useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';

interface FinalScreenProps {
    photo: string;
    qrCodeId: string;
    onFinalize: () => void;
}

const FinalScreen = ({ photo, qrCodeId, onFinalize }: FinalScreenProps) => {
    const qrRef = useRef<HTMLCanvasElement | null>(null);

    const qrCodeUrl = useMemo(() => {
        if (!qrCodeId) {
            console.error('qrCodeId is undefined');
            return '';
        }
        const baseUrl = window.location.origin;
        return `${baseUrl}/#/preview?qrCodeId=${qrCodeId}`;
    }, [qrCodeId]);

    useEffect(() => {
        const timer = setTimeout(() => onFinalize(), 30000);

        if (qrRef.current && qrCodeUrl) {
            QRCode.toCanvas(qrRef.current, qrCodeUrl, {
                width: 150,
                margin: 1,
                color: { light: '#ffffffff', dark: '#000000ff' },
            }, (error) => {
                if (error) console.error('QR Code generation failed:', error);
            });
        }

        return () => clearTimeout(timer);
    }, [onFinalize, qrCodeUrl]);

    return (
        <div className="w-full h-full relative bg-gray-900 text-gray-800">
            <img src={photo} alt="Final" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute bottom-[15%] right-5 w-[180px] cursor-pointer">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-2xl text-center">
                    <p className="font-bold text-sm mb-2">Fazer download</p>
                    <canvas ref={qrRef} className="w-full h-auto" />
                </div>
            </div>
        </div>
    );
};

export default FinalScreen;