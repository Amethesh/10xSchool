interface EightBitInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Add any specific props if needed
  icon?: React.ReactNode; // Optional icon for the input
}

const EightBitInput: React.FC<EightBitInputProps> = ({
  icon,
  className,
  ...props
}) => {
  return (
    <div className="relative w-full">
      <input
        className={`
          font-['Press_Start_2P'] text-[10px] bg-[#222] text-white border-[3px] border-[#666]
          py-[12px] px-[12px] min-w-[200px] outline-none transition-all duration-100 ease-in-out
          placeholder-[#888] focus:bg-[#333] focus:border-[#00ff00] focus:shadow-[0_0_10px_rgba(0,255,0,0.3)]
          ${className || ""}
          ${icon ? "pr-10" : ""} /* Add padding-right if icon is present */
        `}
        {...props}
      />
      {icon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00ff00]">
          {icon}
        </div>
      )}
    </div>
  );
};

export default EightBitInput;
