"use client";
import { createContext, useEffect, useState } from 'react';

const LanguageContext = createContext({
    language: 'english',
    // typeof window !== "undefined" ? JSON.parse(localStorage?.getItem('language') || '') || 'english' : 'english',
    handleChangeLang: () => { console.log("cllll") }
});

function LanguageContextProvider({ children }) {
    const [language, setLanguage] = useState('english');

    useEffect(() => {
        if (typeof window === "undefined") return;
        setLanguage(JSON.parse(localStorage?.getItem('language') || JSON.stringify("english")))
    }, [])

    const handleChangeLang = () => {
        let currLanguage = '';
        language === "english" ? currLanguage = 'bangla' : currLanguage = 'english';
        localStorage.setItem('language', JSON.stringify(currLanguage));
        setLanguage(currLanguage);
    }

    return (
        <LanguageContext.Provider value={{ language, handleChangeLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export { LanguageContext, LanguageContextProvider };