interface ReviewScreenProps {
    photo: string;
    onRetry: () => void;
    onApprove: () => void;
}

const ReviewScreen = ({ photo, onRetry, onApprove }: ReviewScreenProps) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-6">
            <p className="text-2xl font-bold mb-4 text-gray-800">Gostou da foto?</p>
            <div className="w-full max-w-[300px] aspect-[9/16] shadow-lg rounded-lg overflow-hidden mb-8">
                <img src={photo} alt="Captured" className="w-full h-full object-cover" />
            </div>
            <div className="flex space-x-4">
                <button
                    onClick={onRetry}
                    className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
                >
                    Refazer
                </button>
                <button
                    onClick={onApprove}
                    className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                >
                    Aprovar
                </button>
            </div>
        </div>
    );
};

export default ReviewScreen;