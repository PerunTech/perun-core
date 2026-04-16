import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import webpack from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export default (env, params) => {
    return {
        devtool: env.SOURCE_MAP === 'true' ? 'source-map' : false,
        mode: params.mode,
        entry: './frontend/client.js',
        cache: {
            type: 'filesystem',
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    extractComments: false,
                    terserOptions: {
                        format: { comments: false },
                    },
                }),
            ],
        },
        output: {
            path: path.resolve(__dirname, 'www'),
            filename: 'perun-core.js',
            library: { name: 'perun-core', type: 'umd' },
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
                'process.env.GA_TRACKING_ID': JSON.stringify(process.env.GA_TRACKING_ID || ''),
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
                    test: /\.m?js$/,
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
