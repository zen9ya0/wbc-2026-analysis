/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,tsx,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy: '#1a2b4b',
                    red: '#e63946',
                    blue: '#457b9d',
                    light: '#f1faee',
                }
            },
            fontFamily: {
                sporty: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
