const os = require('os');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

// 获取电脑的cpu核数
const threads = os.cpus().length;

// 用来获取处理样式的loader
function getStyleLoader(otherLoader) {
    return [ // 执行顺序从右向左（从下到上）
        // 单独提取css文件时，需要把 style-loader改为 MiniCssExtractPlugin.loader
        MiniCssExtractPlugin.loader,
        // style-loader 会动态创建style标签，在html和js加载完后，显示css样式，容易出现闪屏现象
        // 'style-loader',
        'css-loader',
        {
            loader: "postcss-loader", // 添加css的兼容性处理loader
            options: {
            postcssOptions: {
                plugins: [
                "postcss-preset-env", // 能解决大多数样式兼容性问题
                ],
            },
            },
        },
        otherLoader,
    ].filter(Boolean)
}

module.exports = {
    // 运行模式  production 会打包输出dist目录，不需要devserver本地运行服务器
    mode: 'production',
    devtool: "source-map", // 增加线上报错时，定位问题代码。优点：包含行/列映射; 缺点：打包编译速度更慢
    entry: './src/main.js',
    output: {
        // 所有资源打包后的路径
        path: path.resolve(__dirname, '../dist'),
        // 入口文件打包输出的文件名
        filename: 'static/js/main.js',
        // 在打包前，将dist目录清空
        clean: true, // 每次打包自动清除前一次的内容
    },
    // // 开发服务器
    // devServer: {
    //     host: "localhost", // 启动服务器域名
    //     port: "3000", // 启动服务器端口号
    //     open: true, // 是否自动打开浏览器
    // },
    plugins: [
        // 插件的配置
        // eslint插件配置
        new ESLintPlugin({
            // 检测哪个文件目录下的代码
            context: path.resolve(__dirname, '../src'),
            exclude: 'node_modules', // 默认值，排除node_modules的代码检查
            cache: true, // 开启缓存
            cacheLocation: path.resolve(__dirname, '../node_modules/.cache/eslintcache'),
            threads, // 开启多进程处理
        }),
        new HtmlWebpackPlugin({
            // 配置打包的html模板，生成dist里的新的html文件，并自动引入打包后的main.js
            template: path.resolve(__dirname, '../public/index.html')
        }),
        // 提取css成单独文件
        new MiniCssExtractPlugin({
            // 定义输出文件名和目录
            filename: "static/css/main.css",
        }),
        // css压缩
        // new CssMinimizerPlugin(),
        // new TerserPlugin({
        //     parallel: threads // 开启多进程 设置进程数量
        // })
    ],
    optimization: {
        minimize: true,
        minimizer: [
            // 放置压缩的操作
            new CssMinimizerPlugin(), // css压缩
            new TerserPlugin({ // js压缩
                parallel: threads // 开启多进程 设置进程数量
            })
        ]
    },
    module: {
        rules: [
            // loader 的配置
           {
             // oneOf 提升编译速度
            oneOf: [
                {
                    test: /\.css$/,
                    use: getStyleLoader()
                },
                {
                    test: /\.less$/,
                    use: getStyleLoader('less-loader')
                },
                {
                    test: /\.s[ac]ss$/,
                    use: getStyleLoader('sass-loader')
                },
                {
                    test: /\.styl$/,
                    use: getStyleLoader('stylus-loader')
                },
                {
                    test: /\.(png|jpe?g|gif|webp|svg)$/,
                    type: 'asset', // webpack内置了图片处理loader，不需要再用use,加载loader
                    parser: {
                        dataUrlCondition: {
                          maxSize: 10 * 1024 // 10kb以下的图片会被自动转为base64,减少请求,缺点是图片体积会变大一点
                        }
                    },
                    generator: {
                        // 输出图片的路径和名称
                        // [hash:10] hash值只取前10位
                        // ext 图片的后缀名
                        // query 是？后面携带的参数
                        filename: 'static/images/[hash:10][ext][query]'
                    }
                },
                {
                     // 处理 字体图标资源 iconfont 音视频资源等都可以加到这个配置里
                    test: /\.(ttf|woff2?|mp3|mp4|avi)$/,
                    type: 'asset/resource', // 不会转换，对文件原封不动的输出
                    generator: {
                        // 输出文件的路径和名称
                        // [hash:10] hash值只取前10位
                        // ext 文件的后缀名
                        // query 是？后面携带的参数
                        filename: 'static/media/[hash:10][ext][query]'
                    }
                },
                {
                    test: /\.js$/,
                    // include 和 exclude 只能使用一个，否则会报错
                    exclude: /(node_modules)/, // 排除哪个文件夹的js文件，不进行babel编译
                    // include: path.resolve(__dirname, '../src'), // 只处理src目录下的js文件，其他不处理。
                    use: [
                        {
                            loader: "thread-loader", // 开启多进程
                            options: {
                              workers: threads, // 设置进程数量
                            },
                        },
                        {
                            loader: 'babel-loader',
                            options: { // 可以写在babelrc配置文件里，也可以写在这里
                                // presets: ['@babel/preset-env']
                                cacheDirectory: true, // 开启babel缓存
                                cacheCompression: false, // 关闭缓存文件压缩,压缩会花时间，缓存文件不用压缩就行，最多本地内存占的多一点
                            }
                        }
                    ]
                }
            ]
           }
        ]
    },
}