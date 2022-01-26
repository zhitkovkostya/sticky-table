const { throttle } = require('./throttle');

class StickyTable {
    scrollLeft = 0;
    el = null;
    wrapperElement = null;

    /**
     * Initial render of the table.
     * 
     * @param {object} tableElement - Table DOM element.
     */
    constructor(tableElement) {
        this.el = tableElement;

        this._wrapTable();
        this._wrapTableHead();
        this._wrapTableBody();
        this._syncColumnWidth();
        this._syncHeadPosition();

        this._handleWindowScrollThrottled = throttle(this._handleWindowScroll.bind(this), 20);
        this._handleWindowResizeThrottled = throttle(this._handleWindowResize.bind(this), 20);

        window.addEventListener('scroll', this._handleWindowScrollThrottled.bind(this), false);
        window.addEventListener('resize', this._handleWindowResizeThrottled.bind(this));
    }

    /**
     * Wraps table in a new container.
     */
    _wrapTable() {
        const tableWrapperElement = document.createElement('div');

        tableWrapperElement.className = 'js-table-wrapper';

        this.el.parentNode.insertBefore(tableWrapperElement, this.el);
        tableWrapperElement.append(this.el);
        this.wrapperElement = tableWrapperElement;
    }

    /**
     * Wraps table head in a new table with a scrollable container.
     */
    _wrapTableHead() {
        const tableHeadParentElement = document.createElement('table');
        const tableHeadOriginalElement = this.el.tHead;
        const tableHeadOriginalCellElements = Array.from(tableHeadOriginalElement.querySelectorAll('.js-table-cell'));
        const tableHeadCloneElement = tableHeadOriginalElement.cloneNode(true);

        // Visibility collapse hides the table head visually, but makes it visible for screen readers.
        tableHeadOriginalElement.style.visibility = 'collapse';
        // Safari treats `visibility: collapse` like hidden leaving a white gap, so we hide inner cells manually.
        tableHeadOriginalCellElements.forEach(tableCellElement => {
            tableCellElement.style.lineHeight = 0;
            tableCellElement.style.paddingTop = 0;
            tableCellElement.style.paddingBottom = 0;
        });

        tableHeadParentElement.classList.add('table');

        this.headWrapperElement = document.createElement('div');

        this.headWrapperElement.className = 'js-table-head-wrapper';
        this.headWrapperElement.dataset.isFixed = false;
        this.headWrapperElement.style.overflowX = 'auto';
        this.headWrapperElement.ariaHidden = true;
        this.headWrapperElement
            .appendChild(tableHeadParentElement) 
            .appendChild(tableHeadCloneElement);

        this.wrapperElement.insertBefore(this.headWrapperElement, this.el);

        this._handleHeadWrapperHorizontalScrollThrottled = throttle(this._handleHorizontalScroll.bind(this), 10);
        this.headWrapperElement.addEventListener('scroll', this._handleHeadWrapperHorizontalScrollThrottled.bind(this), false);
    }

    /**
     * Wraps table body in a new table with a scrollable container.
     */
    _wrapTableBody() {
        this.bodyWrapperElement = document.createElement('div');

        this.bodyWrapperElement.className = 'js-table-body-wrapper';
        this.bodyWrapperElement.style.overflowX = 'auto';
        this.wrapperElement.insertBefore(this.bodyWrapperElement, this.el);
        this.bodyWrapperElement.appendChild(this.el);

        this._handleBodyWrapperHorizontalScrollThrottled = throttle(this._handleHorizontalScroll.bind(this), 10);
        this.bodyWrapperElement.addEventListener('scroll', this._handleBodyWrapperHorizontalScrollThrottled.bind(this), false);
    }

    /**
     * Aligns hidden and visible table header widths.
     */
    _syncColumnWidth() {
        const headTableElement = this.headWrapperElement.querySelector('table');
        const bodyTableElement = this.bodyWrapperElement.querySelector('table');

        let headTableCellElement, bodyTableCellWidth;

        for (let bodyTableRowElement of bodyTableElement.tHead.rows) {
            for (let bodyTableCellElement of bodyTableRowElement.cells) {
                bodyTableCellWidth = bodyTableCellElement.offsetWidth;
                headTableCellElement = headTableElement
                    .tHead
                    .rows[bodyTableRowElement.rowIndex]
                    .cells[bodyTableCellElement.cellIndex];

                headTableCellElement.style.minWidth = `${bodyTableCellWidth}px`;
                headTableCellElement.style.maxWidth = `${bodyTableCellWidth}px`;
            }
        }
    }

    /**
     * Fixes table head to the top of the viewport.
     */
    _syncHeadPosition() {
        const isHeadFixed = this.headWrapperElement.dataset.isFixed === 'true';
        const {
            bottom: headWrapperOffsetBottom, 
            width: headWrapperWidth,
            height: headWrapperHeight
        } = this.headWrapperElement.getBoundingClientRect();
        const {
            top: bodyWrapperOffestTop,
            width: bodyWrapperWidth,
        } = this.bodyWrapperElement.getBoundingClientRect();

        if (isHeadFixed && bodyWrapperOffestTop >= headWrapperHeight) {
            this.headWrapperElement.style.position = null;
            this.headWrapperElement.style.top = null;
            this.headWrapperElement.style.zIndex = null;
            this.headWrapperElement.style.width = null;
            this.bodyWrapperElement.style.marginTop = null;
            this.headWrapperElement.dataset.isFixed = false;
        } else if (!isHeadFixed && headWrapperOffsetBottom <= headWrapperHeight) {
            this.headWrapperElement.style.position = 'fixed';
            this.headWrapperElement.style.top = 0;
            this.headWrapperElement.style.zIndex = 2;
            this.headWrapperElement.style.width = bodyWrapperWidth + 'px';
            this.bodyWrapperElement.style.marginTop = headWrapperHeight + 'px';
            this.headWrapperElement.dataset.isFixed = true;
        }

        // Sync table head width with its body on window resize
        if (headWrapperWidth !== bodyWrapperWidth) {
            this.headWrapperElement.style.width = bodyWrapperWidth + 'px';
        }
    }

    /**
     * Aligns horizontal scroll values between table head and body containers.
     * 
     * @returns 
     */
    _syncHorizontalScroll(scrolledElement, targetElement) {
        const scrollLeft = scrolledElement.scrollLeft;
        // const tableRowHeadingElements = this.wrapperElement.querySelectorAll('.table__cell--locked');

        if (this.scrollLeft === scrollLeft) {
            return;
        }

        this.scrollLeft = scrollLeft;
        targetElement.scrollLeft = scrollLeft;

        // tableRowHeadingElements.forEach(tableRowHeadingElement => {
        //     tableRowHeadingElement.style.left = `${scrollLeft}px`;
        // });
    }

    /**
     * Handles horizontal scrolling.
     * 
     * @param {object} event - Scroll event.
     */
    _handleHorizontalScroll(event) {
        const scrolledElement = event.target;
        const targetElement = scrolledElement.nextSibling || scrolledElement.previousSibling;

        this._syncHorizontalScroll(scrolledElement, targetElement);
    }

    /**
     * Handles window scrolling.
     */
    _handleWindowScroll() {
        this._syncHeadPosition();
    }

    /**
     * Handles window resize.
     */
    _handleWindowResize() {
        this._syncHeadPosition();
    }

    /**
     * Destroys the sticky table.
     * 
     * @public
     */
    destroy() {
        window.removeEventListener('scroll', this._handleWindowScrollThrottled, false);
        window.removeEventListener('resize', this._handleWindowResizeThrottled);
        this.headWrapperElement.removeEventListener('scroll', this._handleBodyWrapperHorizontalScrollThrottled, false);
        this.bodyWrapperElement.addEventListener('scroll', this._handleBodyWrapperHorizontalScrollThrottled, false);
    }
}

exports.StickyTable = StickyTable;