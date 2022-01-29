export default class StickyTable {
    el: HTMLTableElement;
    wrapperElement: HTMLElement | null;
    headWrapperElement: HTMLElement | null;
    bodyWrapperElement: HTMLElement | null;
    headTableElement: HTMLTableElement | null;
    bodyTableElement: HTMLTableElement | null;
    scrollLeft: any;
    _handleWindowScrollThrottled: any;
    _handleWindowResizeThrottled: any;
    _handleHeadWrapperHorizontalScrollThrottled: any;
    _handleBodyWrapperHorizontalScrollThrottled: any;

    /**
     * Initial render of the table.
     *
     * @param tableElement - Table DOM element.
     */
    constructor(tableElement: HTMLTableElement) {
        this.el = tableElement;
        this.wrapperElement = null;
        this.headWrapperElement = null;
        this.bodyWrapperElement = null;
        this.headTableElement = null;
        this.bodyTableElement = null;
        this.scrollLeft = 0;
        this._handleWindowScrollThrottled = this._throttle(this._handleWindowScroll.bind(this), 20);
        this._handleWindowResizeThrottled = this._throttle(this._handleWindowResize.bind(this), 20);
        this._handleHeadWrapperHorizontalScrollThrottled = this._throttle(
            this._handleHorizontalScroll.bind(this),
            10
        );
        this._handleBodyWrapperHorizontalScrollThrottled = this._throttle(
            this._handleHorizontalScroll.bind(this),
            10
        );

        this._wrapTable();
        this._wrapTableHead();
        this._wrapTableBody();
        this._syncColumnWidth();
        this._syncHeadPosition();

        window.addEventListener('scroll', this._handleWindowScrollThrottled, false);
        window.addEventListener('resize', this._handleWindowResizeThrottled);
    }

    /**
     * Wraps table in a new container.
     */
    _wrapTable() {
        const tableWrapperElement: HTMLElement = document.createElement('div');

        tableWrapperElement.className = 'js-table-wrapper';

        if (this.el.parentNode) {
            this.el.parentNode.insertBefore(tableWrapperElement, this.el);
        }
        tableWrapperElement.append(this.el);
        this.wrapperElement = tableWrapperElement;
    }

    /**
     * Wraps table head in a new table with a scrollable container.
     */
    _wrapTableHead() {
        const tableHeadOriginalElement: HTMLTableSectionElement | null = this.el.tHead;

        if (!tableHeadOriginalElement) {
            throw new Error('<thead> is missing');
        }

        const tableHeadCloneElement = tableHeadOriginalElement.cloneNode(true);

        this._toggleHeadVisibility(false);

        this.headWrapperElement = document.createElement('div');
        this.headTableElement = document.createElement('table');

        this.headWrapperElement.className = 'js-table-head-wrapper';
        this.headWrapperElement.dataset.isFixed = 'false';
        this.headWrapperElement.style.overflowX = 'auto';
        this.headWrapperElement.ariaHidden = 'true';
        this.headWrapperElement
            .appendChild(this.headTableElement)
            .appendChild(tableHeadCloneElement);

        this.wrapperElement?.insertBefore(this.headWrapperElement, this.el);

        this.headWrapperElement.addEventListener(
            'scroll',
            this._handleHeadWrapperHorizontalScrollThrottled,
            false
        );
    }

    /**
     * Wraps table body in a new table with a scrollable container.
     */
    _wrapTableBody() {
        this.bodyWrapperElement = document.createElement('div');
        this.bodyWrapperElement.className = 'js-table-body-wrapper';
        this.bodyWrapperElement.style.overflowX = 'auto';

        this.wrapperElement?.insertBefore(this.bodyWrapperElement, this.el);
        this.bodyWrapperElement.appendChild(this.el);

        this.bodyWrapperElement.addEventListener(
            'scroll',
            this._handleBodyWrapperHorizontalScrollThrottled,
            false
        );
    }

    /**
     * Aligns hidden and visible table header widths.
     */
    _syncColumnWidth() {
        const headTableElement = this.headTableElement;
        const bodyTableElement = this.el;

        let headTableCellElement: HTMLTableCellElement;
        let bodyTableCellWidth: number;

        if (
            !headTableElement ||
            !bodyTableElement ||
            !bodyTableElement.tHead ||
            !headTableElement.tHead
        ) {
            return;
        }

        for (const bodyTableRowElement of bodyTableElement.tHead.rows) {
            for (const bodyTableCellElement of bodyTableRowElement.cells) {
                bodyTableCellWidth = bodyTableCellElement.offsetWidth;
                headTableCellElement =
                    headTableElement.tHead.rows[bodyTableRowElement.rowIndex].cells[
                        bodyTableCellElement.cellIndex
                    ];

                headTableCellElement.style.minWidth = `${bodyTableCellWidth}px`;
                headTableCellElement.style.maxWidth = `${bodyTableCellWidth}px`;
            }
        }
    }

    /**
     * Fixes table head to the top of the viewport.
     */
    _syncHeadPosition() {
        if (!this.headWrapperElement || !this.bodyWrapperElement) {
            return;
        }

        let isHeadFixed = this.headWrapperElement.dataset.isFixed === 'true';
        const { width: headWrapperWidth, height: headWrapperHeight } =
            this.headWrapperElement.getBoundingClientRect();
        const {
            top: bodyWrapperOffestTop,
            width: bodyWrapperWidth,
            height: bodyWrapperHeight,
        } = this.bodyWrapperElement.getBoundingClientRect();
        const bodyWrapperOffestLimit = isHeadFixed ? 0 : headWrapperHeight;
        const bodyWrapperBottomLimit = headWrapperHeight * 2;
        const isHeadTopInViewport = bodyWrapperOffestTop >= bodyWrapperOffestLimit;
        const isBodyBottomOutsideViewport =
            bodyWrapperHeight + bodyWrapperOffestTop - headWrapperHeight <= 0;

        if (isHeadFixed && (isHeadTopInViewport || isBodyBottomOutsideViewport)) {
            this.headWrapperElement.style.position = '';
            this.headWrapperElement.style.top = '';
            this.headWrapperElement.style.zIndex = '';
            this.headWrapperElement.style.width = '';
            this.bodyWrapperElement.style.paddingTop = '';
            this.headWrapperElement.dataset.isFixed = 'false';
            isHeadFixed = false;
        } else if (!isHeadFixed && !isHeadTopInViewport && !isBodyBottomOutsideViewport) {
            this.headWrapperElement.style.position = 'fixed';
            this.headWrapperElement.style.top = '0';
            this.headWrapperElement.style.zIndex = '2';
            this.headWrapperElement.style.width = bodyWrapperWidth + 'px';
            this.bodyWrapperElement.style.paddingTop = headWrapperHeight + 'px';
            this.headWrapperElement.dataset.isFixed = 'true';
            isHeadFixed = true;
        }

        if (isHeadFixed && bodyWrapperHeight + bodyWrapperOffestTop < bodyWrapperBottomLimit) {
            this.headWrapperElement.style.transform =
                'translate3d(0, ' +
                (bodyWrapperHeight + bodyWrapperOffestTop - bodyWrapperBottomLimit) +
                'px, 0)';
        } else {
            this.headWrapperElement.style.transform = '';
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
    _syncHorizontalScroll(scrolledElement: HTMLElement, targetElement: HTMLElement) {
        const scrollLeft: number = scrolledElement.scrollLeft;
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
     * Accessibly hides or shows table head an innder cells.
     *
     * @param isShow - toggle state.
     */
    _toggleHeadVisibility(isShow = false) {
        const tableHeadOriginalElement: HTMLTableSectionElement | null = this.el.tHead;

        if (!tableHeadOriginalElement) {
            throw new Error('<thead> is missing');
        }

        const tableHeadOriginalRows: Array<HTMLTableRowElement> = Array.from(
            tableHeadOriginalElement.rows
        );
        const tableHeadOriginalCellsByRow: Array<Array<HTMLTableCellElement>> =
            tableHeadOriginalRows.map((row) => Array.from(row.cells));
        const tableHeadOriginalCells: Array<HTMLTableCellElement> = (
            [] as Array<HTMLTableCellElement>
        ).concat(...tableHeadOriginalCellsByRow);

        // Visibility collapse hides the table head visually, but makes it visible for screen readers.
        tableHeadOriginalElement.style.visibility = isShow ? '' : 'collapse';
        // Safari treats `visibility: collapse` like hidden leaving a white gap, so we hide inner cells manually.
        tableHeadOriginalCells.forEach((tableCellElement) => {
            tableCellElement.style.height = isShow ? '' : '0';
            tableCellElement.style.paddingTop = isShow ? '' : '0';
            tableCellElement.style.paddingBottom = isShow ? '' : '0';
            tableCellElement.style.lineHeight = isShow ? '' : '0';
        });
    }

    /**
     * Handles horizontal scrolling.
     *
     * @param event - scroll event.
     */
    _handleHorizontalScroll(event: WheelEvent) {
        const scrolledElement = event.target as HTMLElement;
        const targetElement = (scrolledElement.nextSibling ||
            scrolledElement.previousSibling) as HTMLElement;

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
     * Executes the given function once in an interval.
     *
     * @param fn - callback function
     * @param wait - time to wait for next call
     * @returns
     */
    _throttle(func: (event: WheelEvent) => void, wait = 100): (args: any[]) => void {
        let timer: any = null;

        return (...args: any) => {
            if (timer === null) {
                timer = setTimeout(() => {
                    func.apply(this, args);
                    timer = null;
                }, wait);
            }
        };
    }

    /**
     * Destroys the sticky table.
     *
     * @public
     */
    destroy() {
        window.removeEventListener('scroll', this._handleWindowScrollThrottled, false);
        window.removeEventListener('resize', this._handleWindowResizeThrottled);

        this.headWrapperElement?.removeEventListener(
            'scroll',
            this._handleHeadWrapperHorizontalScrollThrottled,
            false
        );

        this.bodyWrapperElement?.removeEventListener(
            'scroll',
            this._handleBodyWrapperHorizontalScrollThrottled,
            false
        );

        while (this.bodyWrapperElement?.firstChild) {
            this.wrapperElement?.insertBefore(
                this.bodyWrapperElement?.firstChild,
                this.bodyWrapperElement
            );
        }

        while (this.wrapperElement?.firstChild) {
            this.wrapperElement.parentElement?.insertBefore(
                this.wrapperElement?.firstChild,
                this.wrapperElement
            );
        }

        this._toggleHeadVisibility(true);
        this.headWrapperElement?.remove();
        this.bodyWrapperElement?.remove();
        this.wrapperElement?.remove();
    }
}
