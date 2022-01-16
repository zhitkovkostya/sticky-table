document.addEventListener('DOMContentLoaded', () => {
    const tableElements = document.querySelectorAll('.js-table');

    tableElements.forEach(tableElement => {
        new StickyTable(tableElement);
    })
});