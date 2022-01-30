import typescript from '@rollup/plugin-typescript';
import { babel } from '@rollup/plugin-babel';
import banner from 'rollup-plugin-banner';
import { uglify } from 'rollup-plugin-uglify';

const bannerText = 'Vanilla Javascript Sticky Table v<%= pkg.version %>\n<%= pkg.homepage %>';

export default {
    input: 'src/index.ts',
    output: [{
        file: 'dist/bundle.umd.js',
        name: 'StickyTable',
        format: 'umd'
    }, {
        file: 'dist/bundle.cjs.js',
        format: 'cjs'
    }, {
        file: 'dist/bundle.esm.js',
        format: 'es'
    }, {
        file: 'demo/bundle.min.js',
        name: 'StickyTable',
        format: 'umd'
    }],
    plugins: [
        typescript(),
        babel({ 
            babelHelpers: 'bundled',
            extensions: ['ts']
        }),
        uglify(),
        banner(bannerText)
    ]
}