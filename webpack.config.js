let path = require('path');

module.exports = (mode, {env}) => {
    return {
        devtool: 'source-map',
        mode: mode,
        entry: './frontend/client.js',
        output: {
            path: path.resolve('./backend/www'),
            filename: 'perun-core.js',
            library: 'perun-core',
            libraryTarget: 'umd',
            globalObject: 'this'
        },
        devServer: {
            contentBase: './backend/www',
            port: 8080
        },
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
                    test: /\.(|gif|svg|eot|ttf|woff|woff2)$/,
                    loader: 'file-loader',
                    options: {
                        name: '[path][name].[ext]'
                    }
                },
            ]
        },
        resolve: {
            modules: [ // fix all import paths that are not relative, then remove this.
                path.resolve('./frontend'),
                path.resolve('./node_modules'),
                path.resolve('./lib')
            ],
            extensions: ['.js', '.jsx']
        }
    }
};
