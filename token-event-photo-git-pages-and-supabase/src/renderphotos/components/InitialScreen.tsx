import VidigalCode from './VidigalCode.tsx';

interface InitialScreenProps {
    onStart: () => void;
}

const InitialScreen: React.FC<InitialScreenProps> = ({ onStart }) => {

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center text-center  p-8 font-sans">
            <VidigalCode className="w-48 h-auto text-gray-800 mb-12" />
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tighter mb-8">
                Photo Opp
            </h1>
            <button
                onClick={onStart}
                className="w-full max-w-md py-4 bg-gray-800 text-white text-xl
                font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
            >
                Iniciar
            </button>
            <div className="absolute bottom-4 w-full text-center text-gray-600 text-sm">
                we make tech simple
            </div>
        </div>
    );
};

export default InitialScreen;