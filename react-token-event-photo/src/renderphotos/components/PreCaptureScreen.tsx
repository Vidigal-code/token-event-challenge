import Webcam from 'react-webcam';

interface PreCaptureScreenProps {
    webcamRef: React.RefObject<Webcam | null>;
    onCapture: () => void;
}

const PreCaptureScreen = ({ webcamRef, onCapture }: PreCaptureScreenProps) => {

    const videoConstraints = {
        width: 1080,
        height: 1920,
        aspectRatio: 9 / 16,
        facingMode: 'user',
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-end relative bg-black">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                videoConstraints={videoConstraints}
                mirrored={true}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-10 flex items-center justify-center w-full">
                <button
                    onClick={onCapture}
                    aria-label="Capture photo"
                    className="w-20 h-20 rounded-full bg-white ring-4
                    ring-white/30 transition-transform hover:scale-105 active:scale-95"
                />
            </div>
        </div>
    );
};

export default PreCaptureScreen;