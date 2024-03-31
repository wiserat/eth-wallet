import React from 'react';

const Button = ({ onClick, children }) => {
    return (
        <div className="flex items-center justify-center">
            <button onClick={onClick} className="px-4 py-3 rounded-lg bg-stone-500 text-stone-100 font-bold hover:bg-stone-600 duration-300">
                {children}
            </button>
        </div>
    );
};

export default Button;