import { useEffect, useState } from "react"

export const useTheme = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    useEffect(() => {
        const theme =   isDarkMode? "dark": "light";
        localStorage.setItem('theme', theme);

        document.body.setAttribute('data-theme', theme);

        if (isDarkMode) {
            document.body.style.backgroundColor = "#141414";
        } else {
            document.body.style.backgroundColor = "#f0f2f5";
        }
    },[isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode((prev)=> !prev);
    };

    return {
        isDarkMode,
        toggleTheme,
    };
};