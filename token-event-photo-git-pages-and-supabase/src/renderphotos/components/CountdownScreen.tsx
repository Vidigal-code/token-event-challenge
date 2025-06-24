import Webcam from 'react-webcam';

/* *
 * Props for CountdownScreen component
 * @property {number} countdown - The current countdown number to display
 * @property {React.RefObject<Webcam | null>} webcamRef - Reference to the Webcam component
 */
interface CountdownScreenProps {
    countdown: number;
    webcamRef: React.RefObject<Webcam | null>;
}

/* *
 * CountdownScreen component displays a webcam feed with a countdown number overlay.
 * It uses react-webcam to show the camera feed and overlays the countdown in large white text.
 *
 * @param {CountdownScreenProps} props - Props containing countdown number and webcamRef
 * @returns JSX.Element
 */
const CountdownScreen = ({ countdown, webcamRef }: CountdownScreenProps) => {

    /* *
     * Video constraints for the webcam feed:
     * - width: 1080 pixels
     * - height: 1920 pixels
     * - aspect ratio: 9:16 (portrait mode)
     * - facing mode: user-facing camera
     */
    const videoConstraints = {
        width: 1080,
        height: 1920,
        aspectRatio: 9 / 16,
        facingMode: 'user',
    };

    return (
        <div className="w-full h-full relative bg-black">
            <Webcam
                audio={false}
                ref={webcamRef}
                mirrored={true}
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <span className="text-9xl font-bold text-white drop-shadow-2xl">
                    {countdown}
                </span>
            </div>
        </div>
    );
};

export default CountdownScreen;
