/** @type {import('tailwindcss').Config} */
export default {
        content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
        theme: {
                extend: {
                        colors: {
                                "payzone-navy": "#e6f0ff",
                                "payzone-white": "#0f1f3b",
                                "payzone-gold": "#1f6fe5",
                                "payzone-indigo": "#4da3ff",
                                "magic-navy": "#0b2f63",
                        },
                },
        },
        plugins: [],
};
