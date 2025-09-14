import React from 'react';

const loadingMessages = [
  "Warming up the AI's imagination...",
  "Translating your words into pixels...",
  "Weaving digital threads of creativity...",
  "Consulting with the muse of machines...",
  "Painting with algorithmic brushes...",
  "This might take a moment, great art needs patience.",
  "Sharpening details and enhancing resolution...",
  "Applying advanced enhancement algorithms...",
  "Upscaling image for maximum clarity...",
  "Adding the final touches of polish..."
];

export const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(loadingMessages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-lg text-gray-200 animate-pulse">{message}</p>
        </div>
    );
};