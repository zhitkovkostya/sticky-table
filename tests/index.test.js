import StickyTable from '../src/index.ts';
import { createTable } from './utils';

let table;

beforeEach(() => {
    const tableElement = createTable();
    
    table = new StickyTable(tableElement);
});

afterEach(() => {
    table.destroy();
});

test('table wrapper is created', () => {
    expect(table.wrapperElement).toBeDefined();
});


test('table head wrapper is created', () => {
    expect(table.headWrapperElement).toBeDefined();
});

test('table body wrapper is created', () => {
    expect(table.bodyWrapperElement).toBeDefined();
});
