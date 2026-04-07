import React from "react";

const VARIANTS = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-300",
  secondary:
    "bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-2 focus:ring-slate-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-300",
  outline:
    "border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-slate-200",
  ghost:
    "text-slate-700 hover:bg-slate-100 focus:ring-2 focus:ring-slate-200",
};

const SIZES = {
  sm: "px-2.5 py-1.5 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-sm",
};

const AdminButton = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none";

  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const sizeClasses = SIZES[size] || SIZES.md;

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default AdminButton;
