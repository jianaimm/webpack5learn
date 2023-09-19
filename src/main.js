import count from './js/count';
import sum from './js/sum';
import { mul } from './js/math';
import './css/iconfont.css';
import './css/index.css';
import './less/index.less';
import './sass/index.sass';
import './sass/test.scss';
import './stylus/index.styl';


console.log(mul(80,2));
console.log(count(80,2));
console.log(sum(1,3,40));

if(module.hot) {
    // 给js模块添加热替换功能 但是使用vue或react等框架时，有对应的vue-loader等来内置了js热替换，不需要手动写。
    module.hot.accept('./js/count')
    module.hot.accept('./js/sum')
}