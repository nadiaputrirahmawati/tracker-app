import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    isLoading?: boolean;
}

export function Button({ children, className = "", disabled, isLoading = false, ...props }: ButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={`w-full py-3.5 bg-gradient-to-b from-spoket-yellow via-spoket-yellow to-spoket-yellow text-black font-extrabold rounded-2xl text-md uppercase tracking-wider shadow-[0_4px_12px_rgba(0,0,0,0.25),inset_0_2px_2px_rgba(255,255,255,0.35),inset_0_-3px_4px_rgba(0,0,0,0.25)] hover:brightness-105 active:scale-[0.98] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.4)] transition-all duration-150 disabled:bg-none disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:pointer-events-none mt-2 ${className}`}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </button>
    )
}