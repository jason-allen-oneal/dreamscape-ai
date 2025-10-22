interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
  }
  
  export const Input = ({ label, ...props }: InputProps) => (
    <div className="flex flex-col space-y-1">
      {label && <label className="text-sm text-gray-300">{label}</label>}
      <input
        {...props}
        className="bg-slate-900 border border-slate-700 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />
    </div>
  );
  