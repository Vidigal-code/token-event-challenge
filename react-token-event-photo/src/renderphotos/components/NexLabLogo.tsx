const NexLabLogo = ({ className }: { className?: string }) => (
    <svg
        className={className}
        viewBox="0 0 150 50"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
    >
        <rect x="0" y="0" width="50" height="50" stroke="currentColor" strokeWidth="2" fill="none" />
        <text x="5" y="32" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold">NEX</text>
        <text x="60" y="32" fontFamily="Arial, sans-serif" fontSize="24">.lab</text>
    </svg>
);
export default NexLabLogo;