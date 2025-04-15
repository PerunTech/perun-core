const path = require('path');
const webpack = require('webpack');

module.exports = (env, params) => {
    return {
        ...env.SOURCE_MAP === 'true' && { devtool: 'source-map' },
        mode: params.mode,
        entry: './frontend/client.js',
        output: {
            path: path.resolve('./www'),
            filename: 'perun-core.js',
            library: 'perun-core',
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        devServer: {
            client: {
                overlay: false
            },
            static: {
                directory: path.join(__dirname, 'www'),
            },
            compress: true
        },
        plugins: [
            new webpack.ProvidePlugin({
                process: 'process/browser',
            }),
            new webpack.DefinePlugin({
                'process.env.DEBUG': JSON.stringify(env.DEBUG),
                'process.env.MODE': JSON.stringify(params.mode),
            })
        ],
        module: {
            rules: [
                {
                    test: /\.(js|jsx)?$/,
                    exclude: /(node_modules)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            cacheDirectory: true
                        }
                    }
                },
                {
                    // For pure CSS (without CSS modules)
                    test: /\.css$/i,
                    exclude: /\.module\.css$/i,
                    use: ['style-loader', 'css-loader'],
                },
                {
                    // For CSS modules
                    test: /\.module\.css$/i,
                    use: [
                        'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    localIdentName: '[name]-[local]'
                                }
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.m?js/,
                    resolve: { fullySpecified: false }
                },
            ]
        },
        resolve: {
            modules: [ // fix all import paths that are not relative, then remove this.
                path.resolve('./frontend'),
                path.resolve('./node_modules'),
                path.resolve('./lib')
            ],
            extensions: ['.js', '.jsx'],
            fallback: {
                'url': require.resolve('url')
            }
        }
    }
};
