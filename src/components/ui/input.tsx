import { useState } from 'react';

const Input = ({ onValueChange, placeHolder }) => {
    const [value, setValue] = useState('Password');

    const handleChange = (event) => {
        setValue(event.target.value);
        onValueChange(event.target.value);
    };

    return (
        <input
            className="w-full px-4 py-3 placeholder-stone-500 text-stone-100 bg-stone-700 rounded-lg focus:outline-none focus:shadow-outline"
            type="text"
            placeholder={placeHolder}
            onChange={handleChange}
        />
    );
};

export default Input;