const os = require('os');
const path = require('path');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// 获取电脑的cpu核数
const threads = os.cpus().length;
console.log('cpu', threads)

module.exports = {
    // 运行模式 development 不会输出打包目录 dist,path可以不配置，需要配置devserver，本地服务器
    mode: 'development',
    devtool: "cheap-module-source-map", // 报错时，定位问题代码。优点：打包编译速度快，只包含行映射；缺点：没有列映射
    entry: './src/main.js', // 相对路径，根据package.json的位置来的，也就是在哪里运行命令，再取相对路径
    output: {
        // 所有资源打包后的路径
        path: undefined,
        // 入口文件打包输出的文件名
        filename: 'static/js/main.js',
        // 在打包前，将dist目录清空
        // clean: true, // 每次打包自动清除前一次的内容
    },
    // 开发服务器
    devServer: {
        host: "localhost", // 启动服务器域名
        port: "3000", // 启动服务器端口号
        open: true, // 是否自动打开浏览器
        hot: true, // HMR 热模块替换 只更新某个模块，不是整个页面替换 只针对css模块，js需要使用专门的热替换
    },
    plugins: [
        // 插件的配置
        // eslint插件配置
        new ESLintPlugin({
             // 指定检查文件的根目录
            context: path.resolve(__dirname, '../src'), //绝对路径
            exclude: 'node_modules', // 默认值，排除node_modules的代码检查
            cache: true, // 开启缓存
            cacheLocation: path.resolve(__dirname, '../node_modules/.cache/eslintcache'),
            threads, // 开启多进程处理
        }),
        new HtmlWebpackPlugin({
            // 以 public/index.html 为模板创建文件
            // 新的html文件有两个特点：1. 内容和源文件一致 2. 自动引入打包生成的js等资源
            template: path.resolve(__dirname, '../public/index.html')
        })
    ],
    module: {
        rules: [
            // loader 的配置
           {
            // oneOf 提升编译速度
            oneOf: [
                {
                    test: /\.css$/,
                    use: [ // 执行顺序从右向左（从下到上）
                        'style-loader',
                        'css-loader'
                    ]
                },
                {
                    test: /\.less$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'less-loader'
                    ]
                },
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.styl$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'stylus-loader'
                    ]
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