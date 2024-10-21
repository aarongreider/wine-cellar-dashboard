import { ReactNode, useEffect, useRef, useState } from "react"
import './FilterPanel.css'
import { nanoid } from "nanoid"

interface FilterProps {
    filters: string[]
    activeFilters: string[]
    handleFilter: (query: string) => void
}

export function FilterPanel({ filters, activeFilters, handleFilter }: FilterProps) {
    // a relocatable, resizable filter display
    return <>{filters.map((filter, index) => {
        return <FilterInput filter={filter} activeFilters={activeFilters} key={`${filter}-${index}`} handleFilter={handleFilter} />
    })}</>
}

interface InputProps {
    filter: string
    activeFilters: string[]
    handleFilter: (query: string) => void
}
export function FilterInput({ filter, activeFilters, handleFilter }: InputProps) {
    const [checked, setChecked] = useState<boolean>(false)
    useEffect(() => {
        activeFilters?.includes(filter) ? setChecked(true) : setChecked(false)
    }, [])

    return <>
        <div style={{ gap: '4px', padding: 0 }} key={`${filter}-${nanoid()}`}><input type='checkbox' checked={checked} value={filter} onChange={() => { handleFilter(filter); setChecked(!checked) }} />
            <p style={{ margin: 0 }}>{filter}</p>
        </div>
    </>
}


interface PanelProps {
    children: ReactNode
    viewportRes: { x: number, y: number }
    scrollable: boolean
    title?: string

}

export const WithSidePanel = ({ children, viewportRes, scrollable }: PanelProps) => {
    const [isOverflowing, setIsOverflowing] = useState<boolean>(false)

    const filterRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        scrollable && filterRef?.current ? setIsOverflowing(filterRef.current.scrollHeight > filterRef.current.clientHeight) : undefined
    }, [viewportRes])

    return <div ref={filterRef} key={nanoid()} style={{ overflowY: `${isOverflowing ? `scroll` : `hidden`}` }} className="filterPanel">{children}</div>
}

export const WithPopUp = ({ children, title, viewportRes, scrollable }: PanelProps) => {
    const [visible, setVisible] = useState<boolean>(false)
    const [isOverflowing, setIsOverflowing] = useState<boolean>(false)
    const filterRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        scrollable && filterRef?.current ? setIsOverflowing(filterRef.current.scrollHeight > filterRef.current.clientHeight) : undefined
    }, [viewportRes])

    const toggleVisible = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!(e.target instanceof HTMLInputElement)) {
            setVisible(!visible)
            filterRef.current ? filterRef.current.focus() : undefined/* console.log("filterref not available") */;
        }
    }

    const handleBlur = () => {
        setVisible(!visible)
    }

    const handleClickOutside = (event: MouseEvent) => {
        // If clicked outside the menu, close it
        if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
            setVisible(false);
        }
    };

    useEffect(() => {
        // Attach the event listener to detect outside clicks
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup on unmount
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="filterPanel" key={nanoid()} style={{ position: 'relative' }} onClick={toggleVisible}>
            <span style={{ fontSize: '20px', fontVariationSettings: `'FILL' 1` }} className="material-symbols-outlined">bolt</span>
            <p style={{ fontWeight: 600, textWrap: "nowrap", padding: '5px', margin: 0 }}>{title}</p>
            <div ref={filterRef} style={{
                display: `flex`,
                opacity: `${visible ? 1: 0}`,
                pointerEvents: `${visible ? 'all' : 'none'}`,
                flexDirection: 'column',
                gap: '4px',
                alignItems: 'flex-start',
                position: 'absolute',
                maxHeight: '80svh',
                top: '40px',
                right: '0',
                textAlign: "left",
                textWrap: "nowrap",
                fontWeight: 600,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                padding: '14px',
                borderRadius: '18px',
                overflowY: `${isOverflowing ? `scroll` : `hidden`}`
            }}
                tabIndex={0}
                onBlur={handleBlur}>
                {children}
            </div>
        </div>
    )
}