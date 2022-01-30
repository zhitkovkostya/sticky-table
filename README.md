# sticky-table

![GitHub](https://img.shields.io/github/license/zhitkovkostya/sticky-table)

> sticky-table is a library for sticky table headers written in TypeScript. With this library you can easily set sticky table headers on your website. It's responsive, accessible and super tiny.

## Features

- Written in TypeScript, no dependencies needed
- Lightweight (minified: ~5.0kb)
- No additional CSS needed

## Install

### npm

```
npm install sticky-table
```

### yarn

```
yarn add sticky-table
```

## Usage

```html
<table class="js-table">
    <thead>
        <tr>
            <th>...</th>
            <th>...</th>
            ...
            <th>...</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>...</td>
            <td>...</td>
            ...
            <td>...</td>
        </tr>
    </tbody>
</table>
```

```js
document.addEventListener('DOMContentLoaded', () => {
    const tableElements = document.querySelectorAll('.js-table');

    tableElements.forEach(tableElement => {
        new window.StickyTable(tableElement);
    })
});
```

### Development

Clone this repository and run:

```
npm start
```

### Deployment

Create .coveralls.yml to set your Coveralls token.

## Demo

Check out the [demo](https://zhitkovkostya.github.io/sticky-table/)

## Browser Compatibility

Library is using ECMAScript 5 features.

* IE 9+
* Chrome 23+
* Firefox 21+
* Safari 6+
* Opera 15+

## License

[MIT](https://opensource.org/licenses/MIT) © Konstantin Zhitkov
