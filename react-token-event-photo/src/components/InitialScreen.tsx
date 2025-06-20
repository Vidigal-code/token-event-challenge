import NexLabLogo from './NexLabLogo';

interface InitialScreenProps {
    onStart: () => void;
}

const InitialScreen = ({ onStart }: InitialScreenProps) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-gray-200 p-8">
            <NexLabLogo className="w-48 h-auto text-gray-800 mb-12" />
            <h1 className="text-7xl font-bold text-gray-900 tracking-tighter mb-4">
                Photo Opp
            </h1>
            <button
                onClick={onStart}
                className="absolute bottom-10 w-[80%] py-4 bg-gray-800 text-white text-xl font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
            >
                Iniciar
            </button>
        </div>
    );
};

export default InitialScreen;