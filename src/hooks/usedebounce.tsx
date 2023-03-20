import { useState, useEffect } from "react";

type Props = {
  value: string;
  delay: number;
};

export function useDebounce({ value, delay=500 }: Props) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
