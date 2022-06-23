function containerWidthPlugin({ addComponents }) {
    addComponents({
        ".container": {
            maxWidth: "100%",
            "@screen lg": {
                maxWidth: "1280px",
            },
            "@screen xl": {
                maxWidth: "1400px",
            },
        },
    });
}

module.exports = {
    important: true,
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html",
        "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        screens: {
            sm: "640px",
            md: "768px",
            lg: "1024px",
            xl: "1280px",
            // "2xl": "1536px",
        },
        extend: {},
    },
    variants: {
        extend: {},
    },
    plugins: [require("flowbite/plugin"), containerWidthPlugin],
};
