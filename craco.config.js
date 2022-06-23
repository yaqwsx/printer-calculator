module.exports = {
    style: {
        postcss: {
            loaderOptions: (postcssLoaderOptions) => {
                postcssLoaderOptions.postcssOptions.plugins = [
                    require('postcss-import'),
                    require('tailwindcss/nesting'),
                    require('tailwindcss')('./tailwind.config.js'),
                    'postcss-flexbugs-fixes',
                    [
                        'postcss-preset-env',
                        {
                            autoprefixer: {
                                flexbox: 'no-2009',
                            },
                            stage: 3,
                        },
                    ],
                ]

                return postcssLoaderOptions
            },
        },
    },
}
