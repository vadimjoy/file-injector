const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const ExtractCommonCSS = new ExtractTextPlugin("css/common.css");
const ExtractMainCSS = new ExtractTextPlugin("css/main.css");

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.css/i,
                include: path.resolve(__dirname, 'src/css/common.css'),
                exclude: [/node_modules/],
                use: ExtractCommonCSS.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader'
                    ]
                })
            },
            {
                test: /\.css/i,
                include: path.resolve(__dirname, 'src/css/main.css'),
                exclude: [/node_modules/],
                use: ExtractMainCSS.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader'
                    ]
                })
            },
            {
                test: /\.(png|svg|jpe?g|gif)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 30000,
                            name: '[name].[ext]',
                            publicPath: "./",
                            useRelativePath: true
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'dist',
                            useRelativePath: true
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html'
        }),
        ExtractCommonCSS,
        ExtractMainCSS,
        new CleanWebpackPlugin(['dist'], {
            root: path.resolve(__dirname, './')
        })
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        filename: 'file-injector.js',
        library: 'FileInjector',
        libraryTarget: 'umd',
        libraryExport: "default",
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9000
    }
};