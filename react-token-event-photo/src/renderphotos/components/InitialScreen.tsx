import { useNavigate } from 'react-router-dom';
import { IoLogInOutline, IoPersonAddOutline } from 'react-icons/io5';
import NexLabLogo from './NexLabLogo';

interface InitialScreenProps {
    onStart: () => void;
}

const InitialScreen: React.FC<InitialScreenProps> = ({ onStart }) => {
    const navigate = useNavigate();

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-gray-200 to-gray-400 p-8 font-sans">
            <NexLabLogo className="w-48 h-auto text-gray-800 mb-12" />
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tighter mb-8">
                Photo Opp
            </h1>
            <div className="flex flex-col items-center w-full max-w-md space-y-4 mb-12">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full">
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center justify-center w-full sm:w-1/2 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        title="Login"
                    >
                        <IoLogInOutline className="w-5 h-5 mr-2" />
                        <span>Login</span>
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="flex items-center justify-center w-full sm:w-1/2 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
                        title="Sign Up"
                    >
                        <IoPersonAddOutline className="w-5 h-5 mr-2" />
                        <span>Sign Up</span>
                    </button>
                </div>
            </div>
            <button
                onClick={onStart}
                className="w-full max-w-md py-4 bg-gray-800 text-white text-xl font-semibold rounded-lg hover:bg-gray-900 transition-colors shadow-lg"
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