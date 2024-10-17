import { useEffect, useRef, useState } from 'react'
import './App.css'
import { fetchBottleData, filterAdditionalQueries, filterBottles, filterWineTypesByDescriptionAndCountry, sortBottles, WineBottle } from './utils/utils'
import { WineCard } from './components/WineCard/WineCard'
import { wineTypes } from './utils/utils'
import { FilterPanel, WithPopUp, WithSidePanel } from './components/FilterPanel/FilterPanel'
import { WithStickyScroll } from './components/WithStickyScroll'
import { LoadingWidget } from './components/LoadingWidget'
import { WithPinnedScroll } from './components/WithPinnedScroll'

const notFoundIcons = [
  `( ╥﹏╥) ノシ`,
  `( ˘ ³˘)ノ°ﾟº❍｡`,
  `(╯°□°)╯`,
]

function App() {
  const [appLoading, setAppLoading] = useState<boolean>(true)
  const [storeLocation, setStoreLocation] = useState<string | undefined>()
  const [wineBottles, setWineBottles] = useState<WineBottle[]>([])
  const [filteredWineBottles, setFilteredWineBottles] = useState<WineBottle[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [activeWineTypes, setActiveWineTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortQuery, setSortQuery] = useState<string>('')
  const [additionalFiltersCountry, setAdditionalFiltersCountry] = useState<string[]>([])
  const [additionalFiltersWineType, setAdditionalFiltersWineType] = useState<string[]>([])
  const [viewportRes, setViewportRes] = useState({ x: window.innerWidth, y: window.innerHeight })
  const [isMobile, setIsMobile] = useState(viewportRes.x < 650)
  const [jcfDestroyed, setJcfDestroyed] = useState<boolean>(false)
  const sortRef = useRef<HTMLSelectElement>(null);
  const appContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {  // Get the pathname from the current URL
    const pathname = window.location.pathname;
    //const pathname = "/wine-cellar-eastgate/";
    const cleanPath = pathname.replace(/\//g, '');

    if (cleanPath) {
      // Split the last segment by hyphens
      const words = cleanPath.split('-');
      const location = words[words.length - 1]
      console.log(words, location);  // Outputs an array of words split by hyphen
      setStoreLocation(location)
    } else {
      console.log("No valid segment found.");
      setStoreLocation("local")
    }
  }, [])

  useEffect(() => {  // fetch the initial data and set the state
    const fetchData = async () => {
      if (storeLocation) {
        try {
          //console.log("Fetching data");
          const data = await fetchBottleData(storeLocation);
          setWineBottles(data);
          setFilteredWineBottles(data)
        } catch {
          //console.log("Error fetching data in useEffect");
        }
      }
    };

    fetchData();

  }, [storeLocation])



  useEffect(() => { // Setting up the window.onload event inside useEffect
    /* UNBIND JCF FROM SELECT OBJECTS */
    let numRecursions = 0;
    const peskyJCF = () => {
      if (!jcfDestroyed && numRecursions < 10)
        try {
          //console.log("Getting JCF Instance");

          const selectElement = document.querySelector('select');
          //console.log("select object: ", selectElement);

          // Get the jcf instance associated with the select element
          // @ts-ignore
          const jcfInstance = jcf.getInstance(selectElement);

          // Check if instance exists and destroy it
          if (jcfInstance) {
            jcfInstance.destroy();
            console.log("Destroying JCF Instance D:<", jcfInstance);
            setJcfDestroyed(true)
          } else {
            //console.log("NO INSTANCE AHHHH");
            setTimeout(peskyJCF, 500)
          }
        } catch (error) {
          console.log(error);
        }
    }

    window.addEventListener('load', peskyJCF);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener('load', peskyJCF);
    };
  }, []);

  useEffect(() => { // set the loading state of the app when filtered bottles is set successfully
    if (appLoading && (wineBottles.length > 0)) {
      setAppLoading(false)
    }
  }, [filteredWineBottles])

  useEffect(() => { // assemble list of wine types and countries to reference
    //console.log(wineBottles);

    // map to get an array of countries
    const countries = wineBottles.map(bottle => bottle.Country);
    const uniqueCountries = Array.from(new Set(countries));
    setCountries(uniqueCountries)


    setActiveWineTypes(filterWineTypesByDescriptionAndCountry(wineBottles, wineTypes))
  }, [wineBottles])

  useEffect(() => {  // when the user searches for a keyword, filter it here
    if (searchQuery !== '') {
      const filteredList = orderedBottles()
      setFilteredWineBottles(filteredList)
    } else {
      const sortedList = sortBottles(wineBottles, sortQuery)
      setFilteredWineBottles(sortedList)
    }
  }, [searchQuery])

  useEffect(() => { // window size listener
    const handleResize = () => {
      setViewportRes({ x: window.innerWidth, y: window.innerHeight })
      setIsMobile(window.innerWidth < 650)
    };

    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize); // Check on resize

    return () => {
      window.removeEventListener('resize', handleResize); // Cleanup
    };
  }, [window.innerWidth, window.innerHeight, wineBottles]);

  const orderedBottles = (): WineBottle[] => {
    // wine type > country > search query > sort
    return sortBottles(filterBottles(filterAdditionalQueries(filterAdditionalQueries(wineBottles, additionalFiltersWineType), additionalFiltersCountry), searchQuery), sortQuery)
  }

  const onSort = () => {
    const currentVal = sortRef.current?.value ?? ''
    setSortQuery(currentVal)

    const sortedList = sortBottles(filteredWineBottles, currentVal)
    setFilteredWineBottles(sortedList)
  }

  const handleFilterCountry = (query: string) => {
    const newArray = additionalFiltersCountry;
    if (newArray.includes(query)) {
      newArray.splice(newArray.indexOf(query), 1)
    } else {
      newArray.push(query)
    }
    setAdditionalFiltersCountry(newArray)
    const filteredList = orderedBottles()
    setFilteredWineBottles(filteredList)
  }

  const handleFilterWineType = (query: string) => {
    const newArray = additionalFiltersWineType;
    if (newArray.includes(query)) {
      newArray.splice(newArray.indexOf(query), 1)
    } else {
      newArray.push(query)
    }
    setAdditionalFiltersWineType(newArray)
    const filteredList = orderedBottles()
    setFilteredWineBottles(filteredList)
  }



  return (
    <>
      <div id="appContainer" ref={appContainerRef}>
        <h1 style={{ width: `${isMobile ? '100%' : '60%'}`, textAlign: 'left', color: '#e9e5d4', height: `${isMobile ? 'auto' : 0}`, transform: `${isMobile ? 'none' : 'translateY(18px)'}` }}>{storeLocation && storeLocation.charAt(0).toUpperCase() + storeLocation.slice(1)} Wine Cellar Inventory</h1>

        {/* <WithStickyScroll divId={'toolbarWrapper'}>

          <div className='filterToolbar'>
            <div>
              <select ref={sortRef} onChange={onSort} style={{ textAlign: `${isMobile ? 'center' : "left"}` }}>
                <option value={''}>Sort</option>
                <option value={'price descending'}>Price ↓</option>
                <option value={'price ascending'}>Price ↑</option>
                <option value={'year descending'}>Year ↓</option>
                <option value={'year ascending'}>Year ↑</option>
                <option value={'alphabetically'}>A-Z</option>
              </select>
            </div>
            <div className='inputWrapper'>
              <input type="text"
                placeholder="Search..."
                value={searchQuery ?? undefined}
                onChange={(e) => setSearchQuery(e.target.value)} />
              <span className="material-symbols-outlined">search</span>
            </div>
          </div>
          {
            isMobile ?
              <div className='filterToolbar'>
                <WithPopUp viewportRes={viewportRes} title='Country' scrollable={true}>
                  <FilterPanel filters={countries} activeFilters={additionalFiltersCountry} handleFilter={handleFilterCountry} />
                </WithPopUp>
                <WithPopUp viewportRes={viewportRes} title='Wine Type' scrollable={true}>
                  <FilterPanel filters={activeWineTypes} activeFilters={additionalFiltersWineType} handleFilter={handleFilterWineType} />
                </WithPopUp>
              </div> : undefined
          }

        </WithStickyScroll> */}

        <WithPinnedScroll
          divId={'toolbarWrapper'}
          parentRef={appContainerRef}
          filteredWines={[]}
          startTrigger={`top+=${60} top+=${60}`}
          endTrigger={`bottom top+=${140}`}
        >

          <div className='filterToolbar'>
            <div>
              <select ref={sortRef} onChange={onSort} style={{ textAlign: `${isMobile ? 'center' : "left"}` }}>
                <option value={''}>Sort</option>
                <option value={'price descending'}>Price ↓</option>
                <option value={'price ascending'}>Price ↑</option>
                <option value={'year descending'}>Year ↓</option>
                <option value={'year ascending'}>Year ↑</option>
                <option value={'alphabetically'}>A-Z</option>
              </select>
            </div>
            <div className='inputWrapper'>
              <input type="text"
                placeholder="Search..."
                value={searchQuery ?? undefined}
                onChange={(e) => setSearchQuery(e.target.value)} />
              <span className="material-symbols-outlined">search</span>
            </div>
          </div>
          {
            isMobile ?
              <div className='filterToolbar'>
                <WithPopUp viewportRes={viewportRes} title='Country' scrollable={true}>
                  <FilterPanel filters={countries} activeFilters={additionalFiltersCountry} handleFilter={handleFilterCountry} />
                </WithPopUp>
                <WithPopUp viewportRes={viewportRes} title='Wine Type' scrollable={true}>
                  <FilterPanel filters={activeWineTypes} activeFilters={additionalFiltersWineType} handleFilter={handleFilterWineType} />
                </WithPopUp>
              </div> : undefined
          }

        </WithPinnedScroll>

        <p style={{ color: "#e9e5d4", fontWeight: 500, fontStyle: 'italic', width: '100%', textAlign: 'right', paddingRight: '6px', margin: 0 }}>{filteredWineBottles.length} Results</p>

        {
          appLoading ? <LoadingWidget /> :
            <div id="listWrapper">
              {
                !isMobile ?
                  <WithStickyScroll divId='filterWrapper'>
                    <WithSidePanel viewportRes={viewportRes} scrollable={true}>
                      <FilterPanel filters={countries} activeFilters={additionalFiltersCountry} handleFilter={handleFilterCountry} />
                    </WithSidePanel>
                    <WithSidePanel viewportRes={viewportRes} scrollable={true}>
                      <FilterPanel filters={activeWineTypes} activeFilters={additionalFiltersWineType} handleFilter={handleFilterWineType} />
                    </WithSidePanel>
                  </WithStickyScroll> : undefined
              }
              <div id="wineList">
                {filteredWineBottles.length > 0 ? filteredWineBottles.map((bottle, index) => {
                  return Number(bottle.Total) > 0 ? <WineCard key={index} bottle={bottle}></WineCard> : undefined
                  //return <><WineCard key={index} bottle={bottle}></WineCard></>
                }) : <div style={{ flexDirection: 'column' }} className='wineBottle'><p>No Wine Bottles Found</p><p>{notFoundIcons[Math.floor(Math.random() * 3)]}</p></div>}
              </div>
            </div>
        }
      </div >
    </>
  )
}

export default App