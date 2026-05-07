import { useEffect, useState } from "react";

const useDebounce = <T>(value: T, delay: number): T => {
    // Initialize with a safe default value based on type
    const [debouncedValue, setDebouncedValue] = useState<T>(() => {
        if (Array.isArray(value)) {
            return [] as T;
        }
        return value;
    });

    useEffect(() => {
        // Only proceed if we have a valid value
        if (value !== undefined && value !== null) {
            const timerRef = setTimeout(() => {
                if (Array.isArray(value)) {
                    setDebouncedValue([...value] as T);
                } else {
                    setDebouncedValue(value);
                }
            }, delay);

            return () => {
                clearTimeout(timerRef);
            };
        }
    }, [value, delay]);

    return debouncedValue;
};

export { useDebounce };