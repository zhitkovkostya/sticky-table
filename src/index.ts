export default class StickyTable {
    wrapperElement?: HTMLDivElement;
    originalTableWrapperElement?: HTMLDivElement;
    originalTableElement?: HTMLTableElement;
    fixedTableWrapperElement?: HTMLDivElement;
    fixedTableElement?: HTMLTableElement | null;
    scrollLeft?: number;
    scrollElement?: HTMLElement;
    _handleWindowScrollThrottled: (args: any) => void;
    _handleWindowResizeThrottled: (args: any) => void;
    _handleFixedTableWrapperScrollThrottled: (args: any) => void;
    _handleOriginalTableWrapperScrollThrottled: (args: any) => void;

    /**
     * Initial render of the table.
     *
     * @param tableElement Table DOM element.
     * @param scrollElement Element that tableElement will respond on scrolling
     */
    constructor(tableElement: HTMLTableElement, scrollElement: HTMLElement) {
        this.scrollElement = scrollElement;
        this.originalTableElement = tableElement;
        this.wrapperElement = this._wrapTable();
        this.originalTableWrapperElement = this._wrapTableBody();
        this.fixedTableWrapperElement = this._wrapTableHead();
        this.fixedTableElement = this.fixedTableWrapperElement.querySelector('table');
        this.scrollLeft = this.originalTableElement.scrollLeft;
        this._handleWindowScrollThrottled = this._throttle(this._handleWindowScroll.bind(this), 20);
        this._handleWindowResizeThrottled = this._throttle(this._handleWindowResize.bind(this), 20);
        this._handleFixedTableWrapperScrollThrottled = this._throttle(
            this._handleFixedTableWrapperScroll.bind(this),
            20
        );
        this._handleOriginalTableWrapperScrollThrottled = this._throttle(
            this._handleOriginalTableWrapperScroll.bind(this),
            20
        );

        this._syncColumnWidth();
        this._syncHeadPosition();

        this.fixedTableWrapperElement.addEventListener(
            'scroll',
            this._handleFixedTableWrapperScrollThrottled,
            false
        );

        this.originalTableWrapperElement.addEventListener(
            'scroll',
            this._handleOriginalTableWrapperScrollThrottled,
            false
        );

        if (this.scrollElement) {
            this.scrollElement.addEventListener('scroll', this._handleWindowScrollThrottled, false);
        }
        else {
            window.addEventListener('scroll', this._handleWindowScrollThrottled, false);
        }

        window.addEventListener('resize', this._handleWindowResizeThrottled);
    }

    /**
     * Wraps table in a new container.
     *
     * @returns wrapper element
     */
    _wrapTable(): HTMLDivElement {
        const wrapperElement = document.createElement('div');

        wrapperElement.className = 'js-table-wrapper';

        if (this.originalTableElement && this.originalTableElement.parentNode) {
            this.originalTableElement.parentNode.insertBefore(
                wrapperElement,
                this.originalTableElement
            );
            wrapperElement.appendChild(this.originalTableElement);
        }
        return wrapperElement;
    }

    /**
     * Wraps table head in a new table with a scrollable container.
     *
     * @returns fixed table wrapper element
     */
    _wrapTableHead(): HTMLDivElement {
        const originalTableHeadElement = this.originalTableElement
            ? this.originalTableElement.tHead
            : null;

        if (!originalTableHeadElement) {
            throw new Error('<thead> is missing');
        }

        // Create new elements
        const fixedTableHeadElement = originalTableHeadElement.cloneNode(true);
        const fixedTableWrapperElement = document.createElement('div');
        const fixedTableElement = document.createElement('table');

        // set styles
        fixedTableElement.className = this.originalTableElement ? this.originalTableElement.className : '';
        this._toggleHeadVisibility(originalTableHeadElement, false);

        fixedTableWrapperElement.className = 'js-table-head-wrapper';
        fixedTableWrapperElement.dataset.isFixed = 'false';
        fixedTableWrapperElement.style.overflowX = 'hidden';
        fixedTableWrapperElement.ariaHidden = 'true';
        fixedTableWrapperElement.appendChild(fixedTableElement).appendChild(fixedTableHeadElement);

        if (this.wrapperElement && this.originalTableWrapperElement) {
            this.wrapperElement.insertBefore(
                fixedTableWrapperElement,
                this.originalTableWrapperElement
            );
        }

        return fixedTableWrapperElement;
    }

    /**
     * Wraps table body in a new table with a scrollable container.
     *
     * @returns original table wrapper element
     */
    _wrapTableBody(): HTMLDivElement {
        const originalTableWrapperElement = document.createElement('div');

        originalTableWrapperElement.className = 'js-table-body-wrapper';
        originalTableWrapperElement.style.overflowX = 'auto';

        if (this.originalTableElement && this.wrapperElement) {
            this.wrapperElement.insertBefore(
                originalTableWrapperElement,
                this.originalTableElement
            );
            originalTableWrapperElement.appendChild(this.originalTableElement);
        }

        return originalTableWrapperElement;
    }

    /**
     * Aligns hidden and visible table header widths.
     */
    _syncColumnWidth() {
        const fixedTableElement = this.fixedTableElement;
        const originalTableElement = this.originalTableElement;

        if (
            !fixedTableElement ||
            !originalTableElement ||
            !originalTableElement.tHead ||
            !fixedTableElement.tHead
        ) {
            return;
        }

        for (const originalTableRowElement of originalTableElement.tHead.rows) {
            for (const originalTableHeaderElement of originalTableRowElement.cells) {
                const fixedTableHeaderElement =
                    fixedTableElement.tHead.rows[originalTableRowElement.rowIndex]
                        .cells[originalTableHeaderElement.cellIndex];

                const originalTableHeaderStyle = window.getComputedStyle(originalTableHeaderElement);
                let originalTableHeaderWidth = Number(originalTableHeaderElement
                    .getBoundingClientRect().width.toFixed(2)
                );

                if (originalTableHeaderStyle.boxSizing === 'content-box') {
                    originalTableHeaderWidth -= parseFloat(originalTableHeaderStyle.paddingLeft);
                    originalTableHeaderWidth -= parseFloat(originalTableHeaderStyle.paddingRight);
                }

                fixedTableHeaderElement.style.minWidth = `${originalTableHeaderWidth}px`;
                fixedTableHeaderElement.style.maxWidth = `${originalTableHeaderWidth}px`;
            }
        }
    }

    /**
     * Updates fixed table wrapper width based on original table wrapper.
     */
    _syncFixedTableWrapperWidth() {
        if (this.fixedTableWrapperElement && this.originalTableWrapperElement) {
            const { width: fixedTableWrapperWidth } =
                this.fixedTableWrapperElement.getBoundingClientRect();
            const { width: originalTableWrapperWidth } =
                this.originalTableWrapperElement.getBoundingClientRect();

            if (fixedTableWrapperWidth !== originalTableWrapperWidth) {
                this.fixedTableWrapperElement.style.width = originalTableWrapperWidth + 'px';
            }
        }
    }

    /**
     * Fixes table head to the top of the viewport.
     */
    _syncHeadPosition() {
        if (!this.fixedTableWrapperElement || !this.originalTableWrapperElement) {
            return;
        }

        let isFixed = this.fixedTableWrapperElement.dataset.isFixed === 'true';
        const fixedTableWrapperHeight = this.fixedTableWrapperElement.getBoundingClientRect().height;

        const {
            top: originalTableWrapperOffsetTop,
            width: originalTableWrapperWidth,
            height: originalTableWrapperHeight,
        } = this.originalTableWrapperElement.getBoundingClientRect();

        //offset from top of the page to the top of thead
        //_tryGetSearchComponentsHeight is added to make it NOT overlap with sticky-search-components
        const scrollElementsTopOffsetSum = this._tryGetScrollElementTopOffset() + this._tryGetSearchComponentsHeight();;

        //Offset from top of the page to the thead bottom 
        const tableHeaderBottom = scrollElementsTopOffsetSum + fixedTableWrapperHeight

        // When TOP limit is exceeded, thead becomes fixed (sticky like behaviour)
        // "isFixed ?" is here to remove fixed => thead scrolls with the page (normal page behaviour)
        const fixedTableTopLimit = isFixed ? scrollElementsTopOffsetSum : tableHeaderBottom;
        const isOriginalTableTopInViewport = originalTableWrapperOffsetTop >= fixedTableTopLimit;

        // When thead hits bottom limit, "fixed" will be removed for normal page behaviour (We have scrolled table out of view)
        const isOriginalTableBottomOutsideViewport =
            originalTableWrapperHeight + originalTableWrapperOffsetTop - tableHeaderBottom <= 0;

        if (isFixed && (isOriginalTableTopInViewport || isOriginalTableBottomOutsideViewport)) {
            this.fixedTableWrapperElement.style.position = '';
            this.fixedTableWrapperElement.style.top = '';
            this.fixedTableWrapperElement.style.zIndex = '';
            this.fixedTableWrapperElement.style.width = '';
            this.originalTableWrapperElement.style.paddingTop = '';
            this.fixedTableWrapperElement.dataset.isFixed = 'false';
            isFixed = false;
        } else if (
            !isFixed &&
            !isOriginalTableTopInViewport &&
            !isOriginalTableBottomOutsideViewport
        ) {
            this.fixedTableWrapperElement.style.position = 'fixed';
            this.fixedTableWrapperElement.style.top = scrollElementsTopOffsetSum + 'px';
            this.fixedTableWrapperElement.style.zIndex = '2';
            this.fixedTableWrapperElement.style.width = originalTableWrapperWidth + 'px';
            this.originalTableWrapperElement.style.paddingTop = fixedTableWrapperHeight + 'px';
            this.fixedTableWrapperElement.dataset.isFixed = 'true';
            isFixed = true;
        }

        const originalTableBottomLimit = fixedTableWrapperHeight * 2;
        const isNeedToShift =
            originalTableWrapperHeight + originalTableWrapperOffsetTop < originalTableBottomLimit;
        const translateY =
            originalTableWrapperHeight + originalTableWrapperOffsetTop - originalTableBottomLimit;

        this.fixedTableWrapperElement.style.transform =
            isFixed && isNeedToShift ? `translate3d(0, ${translateY}px, 0)` : '';
    }

    /**
     * Aligns horizontal scroll values between table head and body containers.
     */
    _syncHorizontalScroll(scrolledElement: HTMLDivElement, targetElement: HTMLDivElement) {
        const scrollLeft = scrolledElement.scrollLeft;

        if (this.scrollLeft !== scrollLeft) {
            this.scrollLeft = scrollLeft;
            targetElement.scrollLeft = scrollLeft;
        }
    }

    /**
     * Accessibly hides or shows table head an innder cells.
     *
     * @param headElement Table head element.
     * @param isShow Toggle state.
     */
    _toggleHeadVisibility(headElement?: HTMLTableSectionElement, isShow = false) {
        if (!headElement) {
            throw new Error('<thead> is missing');
        }

        const headRows = Array.from(headElement.rows);
        const headCellsByRow = headRows.map((rowElement) => Array.from(rowElement.cells));
        const headCells = ([] as Array<HTMLTableCellElement>).concat(...headCellsByRow);

        // Visibility collapse hides the table head visually, but makes it visible for screen readers.
        headElement.style.visibility = isShow ? '' : 'collapse';
        // Safari treats `visibility: collapse` like hidden leaving a white gap, so we hide inner cells manually.
        headCells.forEach((cellElement) => {
            cellElement.style.height = isShow ? '' : '0';
            cellElement.style.paddingTop = isShow ? '' : '0';
            cellElement.style.paddingBottom = isShow ? '' : '0';
            cellElement.style.lineHeight = isShow ? '' : '0';
        });
    }

    /**
     * Handles horizontal scrolling for fixed table wrapper.
     *
     * @param event Scroll event.
     */
    _handleFixedTableWrapperScroll(event: WheelEvent) {
        if (this.fixedTableWrapperElement && this.originalTableWrapperElement) {
            this._syncHorizontalScroll(
                this.fixedTableWrapperElement,
                this.originalTableWrapperElement
            );
        }
    }

    /**
     * Handles horizontal scrolling for original table wrapper.
     *
     * @param event Scroll event.
     */
    _handleOriginalTableWrapperScroll(event: WheelEvent) {
        if (this.fixedTableWrapperElement && this.originalTableWrapperElement) {
            this._syncHorizontalScroll(
                this.originalTableWrapperElement,
                this.fixedTableWrapperElement
            );
        }
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
        this._syncColumnWidth();
        this._syncFixedTableWrapperWidth();
    }

    /**
     * Executes the given function once in an interval.
     *
     * @param func Callback function
     * @param wait Time to wait for next call
     * @returns callback function
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
    * @returns this.scrollElement.offsetTop or 0 if undefined
    */
    _tryGetScrollElementTopOffset() {
        return this.scrollElement ? this.scrollElement.offsetTop : 0;
    }

    /**
     * 
     */
    _tryGetSearchComponentsHeight() {
        const searchComponents = document.getElementsByClassName('sticky-search-components');

        if (!searchComponents || searchComponents.length < 1) {
            return 0;
        }

        return searchComponents[0].getBoundingClientRect().height;
    }

    /**
     * Destroys the sticky table.
     *
     * @public
     */
    destroy() {
        if (this.scrollElement) {
            this.scrollElement.removeEventListener('scroll', this._handleWindowScrollThrottled, false);
        }
        else {
            window.removeEventListener('scroll', this._handleWindowScrollThrottled, false);
        }


        window.removeEventListener('resize', this._handleWindowResizeThrottled);

        this.fixedTableWrapperElement?.removeEventListener(
            'scroll',
            this._handleFixedTableWrapperScrollThrottled,
            false
        );

        this.originalTableWrapperElement?.removeEventListener(
            'scroll',
            this._handleOriginalTableWrapperScrollThrottled,
            false
        );

        while (this.originalTableWrapperElement?.firstChild) {
            this.wrapperElement?.insertBefore(
                this.originalTableWrapperElement?.firstChild,
                this.originalTableWrapperElement
            );
        }

        while (this.wrapperElement?.firstChild) {
            this.wrapperElement.parentElement?.insertBefore(
                this.wrapperElement?.firstChild,
                this.wrapperElement
            );
        }

        if (this.originalTableElement && this.originalTableElement.tHead) {
            this._toggleHeadVisibility(this.originalTableElement.tHead, true);
        }

        this.fixedTableWrapperElement?.remove();
        this.originalTableWrapperElement?.remove();
        this.wrapperElement?.remove();

        delete this.originalTableElement;
        delete this.fixedTableWrapperElement;
        delete this.fixedTableElement;
        delete this.originalTableWrapperElement;
        delete this.wrapperElement;
        delete this.scrollLeft;
    }
}
