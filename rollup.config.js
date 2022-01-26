import commonjs from '@rollup/plugin-commonjs';
import banner from 'rollup-plugin-banner';
import { uglify } from 'rollup-plugin-uglify';

const bannerText = 'Vanilla Javascript Sticky Table v<%= pkg.version %>\n<%= pkg.homepage %>';

export default {
    input: 'src/index.js',
    output: [{
        file: 'dist/bundle.min.js',
        name: 'VanillaStickyTable',
        format: 'umd'
    }, {
        file: 'demo/bundle.min.js',
        name: 'VanillaStickyTable',
        format: 'umd'
    }],
    plugins: [
        commonjs(),
        // uglify(),
        banner(bannerText)
    ]
}