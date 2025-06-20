import { useEffect, useRef, useMemo } from 'react';
import QRCode from 'qrcode';

interface FinalScreenProps {
    photo: string;
    onFinalize: () => void;
}

const FinalScreen = ({ photo, onFinalize }: FinalScreenProps) => {

    const qrRef = useRef<HTMLCanvasElement | null>(null);

    const downloadUrl = useMemo(() => {
        if (!photo) return '';
        const byteString = atob(photo.split(',')[1]);
        const mimeString = photo.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        return URL.createObjectURL(blob);
    }, [photo]);

    useEffect(() => {
        const timer = setTimeout(() => onFinalize(), 30000);

        if (qrRef.current && downloadUrl) {
            QRCode.toCanvas(qrRef.current, downloadUrl, {
                width: 150,
                margin: 1,
                color: { light: '#ffffffff', dark: '#000000ff' }
            }, (error) => {
                if (error) console.error('QR Code generation failed:', error);
            });
        }

        return () => {
            clearTimeout(timer);
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        };
    }, [onFinalize, downloadUrl]);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'nexlab-photo.png';
        link.click();
    };

    return (
        <div className="w-full h-full relative bg-gray-900 text-gray-800">
            <img src={photo} alt="Final" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute bottom-[15%] right-5 w-[180px] cursor-pointer" onClick={handleDownload}>
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-2xl text-center">
                    <p className="font-bold text-sm mb-2">Fazer download</p>
                    <canvas ref={qrRef} className="w-full h-auto" />
                </div>
            </div>
        </div>
    );
};

export default FinalScreen;