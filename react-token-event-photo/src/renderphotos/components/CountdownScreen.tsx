import Webcam from 'react-webcam';

interface CountdownScreenProps {
    countdown: number;
    webcamRef: React.RefObject<Webcam | null>;
}

const CountdownScreen = ({ countdown, webcamRef }: CountdownScreenProps) => {

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