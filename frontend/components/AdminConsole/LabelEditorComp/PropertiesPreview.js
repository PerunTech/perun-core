import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// LINE_HEIGHT must equal the CSS `line-height` on .label-export-preview pre exactly.
// Any mismatch causes the padding-based scroll math to drift at large offsets.
const LINE_HEIGHT = 20; // px
const OVERSCAN = 30; // extra lines rendered above/below viewport to prevent blank flicker on fast scroll

const renderLine = (line, key) => {
    if (line.startsWith('#')) {
        return <span key={key} className='lep-comment'>{line}{'\n'}</span>;
    }
    const eq = line.indexOf('=');
    if (eq !== -1) {
        return (
            <span key={key}>
                <span className='lep-key'>{line.slice(0, eq)}</span>
                <span className='lep-eq'>{'='}</span>
                <span className='lep-value'>{line.slice(eq + 1)}</span>
                {'\n'}
            </span>
        );
    }
    return <span key={key}>{line}{'\n'}</span>;
};

const PropertiesPreview = ({ text }) => {
    const containerRef = useRef(null);
    const lines = useMemo(() => text.split('\n'), [text]);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(400);

    useEffect(() => {
        if (containerRef.current) setContainerHeight(containerRef.current.clientHeight);
    }, []);

    const handleScroll = useCallback((e) => setScrollTop(e.currentTarget.scrollTop), []);

    const start = Math.max(0, Math.floor(scrollTop / LINE_HEIGHT) - OVERSCAN);
    const end = Math.min(lines.length, Math.ceil((scrollTop + containerHeight) / LINE_HEIGHT) + OVERSCAN);

    // paddingTop/Bottom pad the <pre> to the full content height so the scrollbar
    // reflects the total line count while only the visible slice is in the DOM.
    return (
        <div ref={containerRef} className='label-export-preview' onScroll={handleScroll}>
            <pre style={{ margin: 0, paddingTop: start * LINE_HEIGHT, paddingBottom: (lines.length - end) * LINE_HEIGHT }}>
                {lines.slice(start, end).map((line, i) => renderLine(line, start + i))}
            </pre>
        </div>
    );
};

export default PropertiesPreview;
