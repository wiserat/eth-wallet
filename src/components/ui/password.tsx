import { useState } from 'react';

const Password = ({ onValueChange }) => {
    const [value, setValue] = useState('Password');

    const handleChange = (event) => {
        setValue(event.target.value);
        onValueChange(event.target.value);
    };

    return (
        <input
            className="w-full px-4 py-3 placeholder-stone-500 text-stone-100 bg-stone-700 rounded-lg focus:outline-none focus:shadow-outline"
            type="password"
            placeholder='password'
            onChange={handleChange}
        />
    );
};

export default Password;