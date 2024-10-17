import { MutableRefObject, ReactNode, RefObject, useEffect, useRef } from "react"
import { WineBottle } from "../utils/utils"
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

interface WithStickyProps {
    //setSticky: (isSticky: boolean) => void
    parentRef: RefObject<HTMLDivElement> | null
    divId: string
    filteredWines: WineBottle[]
    appLoaded?: boolean
    startTrigger: string
    endTrigger?: string
    children: ReactNode
}

gsap.registerPlugin(ScrollTrigger)

export const WithPinnedScroll = ({ parentRef, divId, filteredWines, startTrigger, endTrigger, children }: WithStickyProps) => {
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initScrollTrigger = () => {
            console.log(targetRef.current, parentRef?.current);
            

            if (targetRef.current && parentRef) {
                console.log("Initializing Scroll Trigger");
                const targetElement = targetRef.current;
                const parentElement = parentRef.current;
                const offsetTop = 60 // hardcoded offset from the top (60px) -height of the target


                // Create GSAP ScrollTrigger
                gsap.fromTo(
                    targetElement,
                    { y: 0 }, // Initial state, no translation
                    {
                        //y: () => window.innerHeight - 60, // Position at 60px from the top of the viewport
                        ease: "none",
                        scrollTrigger: {
                            trigger: parentElement,
                            endTrigger: parentElement,
                            start: startTrigger, // When parent element hits 60px from the top of the viewport
                            end: () => endTrigger ?? `bottom top`, // End when the bottom of the parent reaches 60px from the bottom
                            pin: targetElement, // Pin the target element
                            pinSpacing: false, // No extra space added during pinning
                            scrub: true, // Smooth transition to mimic sticky behavior
                            markers: true, // Optional: for debugging
                        }
                    }
                );
            } else {
                setTimeout(initScrollTrigger, 500)
            }
        }

        window.addEventListener('load', initScrollTrigger);

        //initScrollTrigger()



        // Cleanup ScrollTrigger when component unmounts
        /* return () => {
            console.log("killing triggers");

            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        }; */
    }, []);

    useEffect(()=>{
        ScrollTrigger.refresh()
    })

    return <>
        <div>
            <div id={divId} ref={targetRef}>
                {children}
            </div>
        </div>
    </>
}