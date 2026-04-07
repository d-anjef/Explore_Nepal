import React from "react";

const AdminTable = ({ children, className = "" }) => {
  return (
    <div
      className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <table className="min-w-full text-sm text-left text-slate-700">
        {children}
      </table>
    </div>
  );
};

export default AdminTable;
