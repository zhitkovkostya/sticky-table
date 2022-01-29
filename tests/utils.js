const tableMarkup = `
<table class="js-table">
    <thead>
        <tr>
            <th>Heading 1</th>
            <th>Heading 2</th>
            <th>Heading 3</th>
            <th>Heading 4</th>
            <th>Heading 5</th>
            <th>Heading 6</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td>Cell 3</td>
            <td>Cell 4</td>
            <td>Cell 5</td>
            <td>Cell 6</td>
        </tr>
    </tbody>
</table>
`;

/**
 * Renders table element to the DOM.
 * 
 * @returns HTMLTableElement
 */
export function createTable() {
    document.body.innerHTML = tableMarkup;

    return document.querySelector('.js-table');
}