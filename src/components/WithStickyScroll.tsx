import { ReactNode, useEffect, useRef, useState } from "react"

interface WithStickyProps {
    //setSticky: (isSticky: boolean) => void
    divId: string
    children: ReactNode
}
export const WithStickyScroll = ({ divId, children }: WithStickyProps) => {
    const [isSticky, setSticky] = useState<boolean>(false)
    const [userScrollY, setUserScrollY] = useState<number>(0);
    const [initialToolbarPosition, setInitialToolbarPosition] = useState<number>();
    const anchorRef = useRef<HTMLDivElement>(null);


    useEffect(() => { // mount scroll listener
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => { // calculate the inital bounding rect of the toolbar anchor
        let pos = anchorRef.current?.getBoundingClientRect().top
        pos ? pos += userScrollY : pos
        setInitialToolbarPosition(pos);
    }, [anchorRef, window.innerWidth]);

    useEffect(() => {  // is anchor pos is reset, evaluate sticky
        if (initialToolbarPosition && userScrollY >= (initialToolbarPosition - 60)) {
            setSticky(true)
        } else if (initialToolbarPosition && userScrollY <= (initialToolbarPosition - 60)) {
            setSticky(false)
        }
        //console.log(initialToolbarPosition);

    }, [initialToolbarPosition])

    useEffect(() => { // when user scrolls, evaluate sticky

        /* IF CONDITION IS MET CALL SETSTICKY() AND BUBBLE UP */
        if (initialToolbarPosition && userScrollY >= (initialToolbarPosition - 60)) {
            //console.log("setting sticky true")
            setSticky(true)
        } else if (initialToolbarPosition && userScrollY <= (initialToolbarPosition - 60)) {
            //console.log("setting sticky true")
            setSticky(false)
        }

    }, [scrollY])

    const handleScroll = () => { // on scroll, if document scrollTop is less than initialScrollPosition

        //const totalHeight = document.documentElement.scrollHeight;
        const scrollY = window.scrollY || window.pageYOffset;
        setUserScrollY(scrollY);
    }

    const getOffsetRight = (anchorRef: HTMLDivElement | null): number => {
        if (anchorRef) {
          const rightPos = anchorRef.getBoundingClientRect().right
          const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth; // Account for scrollbar
          const offset = window.innerWidth - (rightPos + scrollbarWidth)
          return offset
        }
        return 50
      }

    return <>
        <div style={{ position: 'relative'}} ref={anchorRef}>
            <div id={divId} style={{
                position: `${isSticky ? 'fixed' : 'absolute'}`,
                right: `${isSticky ? `${getOffsetRight(anchorRef.current)}px` : 0}`,
                top: `${isSticky ? `60px` : 0}`
            }}>
                {children}
            </div>
            <div className={divId} style={{zIndex: '-1'}}>
                {children}
            </div>
            
        </div>
    </>
}