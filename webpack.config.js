module.exports = {
    entry: [
        './src/index.js'
    ],
    output: {
        filename: 'main.js'
    },
	module: {
        rules: [
            // perform js babelization on all .js files
            {
                test: /\.(js|jsx)$/,
                exclude: '/node_modules/',
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/react', '@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            importLoaders: 2
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            importLoaders: 1
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            },
            {
                test: /.(png|woff2?|eot|ttf|svg|jpg)(\?[a-z0-9=\.]+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '../css/[hash].[ext]',
                            publicPath: './'
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.', '.js', '.jsx', '.scss', '.css']
    },
}