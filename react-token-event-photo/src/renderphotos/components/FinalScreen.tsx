import {useEffect, useRef, useMemo} from 'react';
import QRCode from 'qrcode';

/*interface FinalScreenProps {
    photo: string;
    id: string;
    qrCodeId: string;
    onFinalize: () => void;
}*/

interface FinalScreenProps {
    photo: string;
    qrCodeId: string;
    onFinalize: () => void;
}

const FinalScreen = ({photo, qrCodeId, onFinalize}: FinalScreenProps) => {
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
                color: {light: '#ffffffff', dark: '#000000ff'},
            }, (error) => {
                if (error) console.error('QR Code generation failed:', error);
            });
        }

        return () => {
            clearTimeout(timer);
        };

    }, [onFinalize, qrCodeUrl]);

    /* const handleDownload = () => {
         if (!photo) return;
         const link = document.createElement('a');
         link.href = photo;
         link.download = `nexlab-photo-${id || 'view'}.png`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
     };

     const handleDownloadQR = () => {
         if (qrRef.current && qrCodeId) {
             const qrImage = qrRef.current.toDataURL('image/png');
             const link = document.createElement('a');
             link.href = qrImage;
             link.download = `nexlab-qr-${qrCodeId}.png`;
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
         } else {
             console.error('Cannot download QR code: canvas or qrCodeId missing');
         }
     };*/

    return (
        <div className="w-full h-full relative bg-gray-900 text-gray-800">
            <img src={photo} alt="Final" className="absolute inset-0 w-full h-full object-cover"/>
            <div className="absolute bottom-[15%] right-5 w-[180px] cursor-pointer">
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-2xl text-center">
                    <p className="font-bold text-sm mb-2">Fazer download</p>
                    <canvas ref={qrRef} className="w-full h-auto"/>
                    {/*  <button
                        onClick={handleDownload}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        disabled={!photo}
                    >
                        Download Imagem
                    </button>
                    <button
                        onClick={handleDownloadQR}
                        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        disabled={!qrCodeId}
                    >
                        Download QR Code
                    </button> */}
                </div>
            </div>
        </div>
    );
};

export default FinalScreen;