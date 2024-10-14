import { ReactNode, useEffect, useRef, useState } from "react"

interface WithStickyProps {
    setSticky: (isSticky: boolean) => void
    setToolbarRef: (ref: HTMLDivElement | null) => void
    children: ReactNode
}
export const WithStickyScroll = ({ setSticky, setToolbarRef, children }: WithStickyProps) => {
    const [userScrollY, setUserScrollY] = useState<number>(0);
    const [initialToolbarPosition, setInitialToolbarPosition] = useState<number>();
    const toolbarAnchorRef = useRef<HTMLDivElement>(null);


    useEffect(() => { // mount scroll listener
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => { // calculate the inital bounding rect of the toolbar anchor
        let pos = toolbarAnchorRef.current?.getBoundingClientRect().top
        pos ? pos +=  userScrollY : pos
        setInitialToolbarPosition(pos);
    }, [toolbarAnchorRef, window.innerWidth]);

    useEffect(() => {  // is anchor pos is reset, evaluate sticky
        if (initialToolbarPosition && userScrollY >= (initialToolbarPosition-60)) {
            setSticky(true)
        } else if (initialToolbarPosition && userScrollY <= (initialToolbarPosition-60)) {
            setSticky(false)
        }
        console.log(initialToolbarPosition);
        
    }, [initialToolbarPosition])

    useEffect(() => { // when user scrolls, evaluate sticky

        /* IF CONDITION IS MET CALL SETSTICKY() AND BUBBLE UP */
        if (initialToolbarPosition && userScrollY >= (initialToolbarPosition-60)) {
            //console.log("setting sticky true")
            setSticky(true)
        } else if (initialToolbarPosition && userScrollY <= (initialToolbarPosition-60)) {
            //console.log("setting sticky true")
            setSticky(false)
        }

    }, [scrollY])

    useEffect(() => { // pass the anchor reference to the parent
        setToolbarRef(toolbarAnchorRef.current);
        return () => setToolbarRef(null)
    }, [setToolbarRef]);

    const handleScroll = () => { // on scroll, if document scrollTop is less than initialScrollPosition

        //const totalHeight = document.documentElement.scrollHeight;
        const scrollY = window.scrollY || window.pageYOffset;
        setUserScrollY(scrollY);
    }

    return <>
        <div style={{ position: 'relative', height: '40px' }} id="toolbarScrollAnchor" ref={toolbarAnchorRef}>
            {children}
        </div>
    </>
}