# vanilla-js-sticky-table

Vanilla JavaScript sticky table - accessible and super tiny

*— Inspired by the blazing fast, lightweight, cross-platform and crazy popular [Vanilla JS](http://vanilla-js.com/)  framework.*

## Install

### npm

```
npm install vanilla-js-sticky-table
```

### yarn

```
yarn add vanilla-js-sticky-table
```

## Usage

```js
document.addEventListener('DOMContentLoaded', () => {
    const tableElements = document.querySelectorAll('.js-table');

    tableElements.forEach(tableElement => {
        new StickyTable(tableElement);
    })
});
```

## Demo

Check out the [demo](https://zhitkovkostya.github.io/vanilla-js-sticky-table/)

## License

[MIT](https://opensource.org/licenses/MIT) © Konstantin Zhitkov
