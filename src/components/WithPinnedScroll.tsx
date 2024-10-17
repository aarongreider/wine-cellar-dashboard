import { ReactNode, useEffect, useLayoutEffect, useRef } from "react"
import { WineBottle } from "../utils/utils"
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

interface WithStickyProps {
    //setSticky: (isSticky: boolean) => void
    parentWrapper: HTMLDivElement | null
    divId: string
    filteredWines: WineBottle[]
    appLoaded?: boolean
    setFilteredWines: (list: WineBottle[]) => void
    startTrigger: string
    endTrigger?: string
    children: ReactNode
}



export const WithPinnedScroll = ({ parentWrapper, divId, filteredWines, appLoaded, setFilteredWines, startTrigger, endTrigger, children }: WithStickyProps) => {

    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initScrollTrigger = () => {
            console.log("Initializing Scroll Trigger");

            if (targetRef.current && parentWrapper) {
                const targetElement = targetRef.current;
                //const parentElement = parentRef.current;
                const offsetTop = 60 // hardcoded offset from the top (60px) -height of the target


                // Create GSAP ScrollTrigger
                gsap.fromTo(
                    targetElement,
                    { y: 0 }, // Initial state, no translation
                    {
                        //y: () => window.innerHeight - 60, // Position at 60px from the top of the viewport
                        ease: "none",
                        scrollTrigger: {
                            trigger: parentWrapper,
                            endTrigger: parentWrapper,
                            start: startTrigger, // When parent element hits 60px from the top of the viewport
                            end: () => endTrigger ?? `bottom top+=${offsetTop + targetElement.getBoundingClientRect().height}`, // End when the bottom of the parent reaches 60px from the bottom
                            pin: targetElement, // Pin the target element
                            pinSpacing: false, // No extra space added during pinning
                            scrub: true, // Smooth transition to mimic sticky behavior
                            markers: true, // Optional: for debugging
                        }
                    }
                );
            }
        }

        //window.addEventListener('load', initScrollTrigger);
        if (document.readyState === 'complete') {
            initScrollTrigger()
        }


        // Cleanup ScrollTrigger when component unmounts
        return () => {
            console.log("killing triggers");

            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [filteredWines]);

    useEffect(() => {
        ScrollTrigger.refresh()
    });


    useLayoutEffect(() => {
        ScrollTrigger.refresh();  // Manually refresh after filteredWines or children change
    }, [filteredWines, children]);

    return <>
        <div>
            <div id={divId} ref={targetRef}>
                {children}
            </div>
        </div>
    </>
}