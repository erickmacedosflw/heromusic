import { useEffect, useRef } from 'react';

const useGameLoop = (update: (deltaTime: number) => void = () => {}) => {
    const requestRef = useRef<number | null>(null);
    const previousTimeRef = useRef<number>(0);

    const loop = (time: number) => {
        if (previousTimeRef.current !== 0) {
            const deltaTime = time - previousTimeRef.current;
            update(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    return null;
};

export default useGameLoop;