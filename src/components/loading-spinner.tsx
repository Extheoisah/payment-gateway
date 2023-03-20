type LoadingSpinnerProps = {
  size: "small" | "large";
};

const LoadingSpinner = ({ size }: LoadingSpinnerProps) => {
  const height = size === "small" ? "h-4" : "h-10";
  const width = size === "small" ? "w-4" : "w-10";
  const borderTop = size === "small" ? "border-t-2" : "border-t-4";

  return (
    <div
      className={`${height} ${width} border ${borderTop} border-green-300 border-solid rounded-full animate-spinner`}
    ></div>
  );
};

export default LoadingSpinner;
