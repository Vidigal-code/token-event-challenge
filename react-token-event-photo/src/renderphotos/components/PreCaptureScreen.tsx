import Webcam from 'react-webcam';

/**
 * Props for PreCaptureScreen component
 * @property {React.RefObject<Webcam | null>} webcamRef - Reference to the Webcam component
 * @property {() => void} onCapture - Callback function to trigger photo capture
 */
interface PreCaptureScreenProps {
    webcamRef: React.RefObject<Webcam | null>;
    onCapture: () => void;
}

/**
 * PreCaptureScreen component displays the live webcam feed
 * and a capture button to take a photo.
 *
 * @param {PreCaptureScreenProps} props - Component props
 * @returns JSX.Element
 */
const PreCaptureScreen = ({ webcamRef, onCapture }: PreCaptureScreenProps) => {

    /**
     * Video constraints for the webcam feed:
     * - width: 1080 pixels
     * - height: 1920 pixels
     * - aspect ratio: 9:16 (portrait)
     * - facing mode: user-facing camera
     */
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
