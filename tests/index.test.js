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

test('wrapper is created', () => {
    expect(table.wrapperElement).toBeDefined();
});


test('fixed table wrapper is created', () => {
    expect(table.fixedTableWrapperElement).toBeDefined();
});

test('original table wrapper is created', () => {
    expect(table.originalTableWrapperElement).toBeDefined();
});
