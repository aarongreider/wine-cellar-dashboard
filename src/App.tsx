import { useEffect, useRef, useState } from 'react'
import './App.css'
import { fetchBottleData, filterAdditionalQueries, filterBottles, filterWineTypesByDescriptionAndCountry, sortBottles, WineBottle } from './utils/utils'
import { WineCard } from './components/WineCard/WineCard'
import { wineTypes } from './utils/utils'
import { FilterPanel, WithPopUp, WithSidePanel } from './components/FilterPanel/FilterPanel'

const notFoundIcons = [
  `( ╥﹏╥) ノシ`,
  `( ˘ ³˘)ノ°ﾟº❍｡`,
  `(╯°□°)╯`,
]

function App() {
  const [wineBottles, setWineBottles] = useState<WineBottle[]>([])
  const [filteredWineBottles, setFilteredWineBottles] = useState<WineBottle[]>([])
  const [countries, setCountries] = useState<string[]>([])
  const [activeWineTypes, setActiveWineTypes] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortQuery, setSortQuery] = useState<string>('')
  const [additionalFiltersCountry, setAdditionalFiltersCountry] = useState<string[]>([])
  const [additionalFiltersWineType, setAdditionalFiltersWineType] = useState<string[]>([])
  const [viewportRes, setViewportRes] = useState({ x: window.innerWidth, y: window.innerHeight })
  const sortRef = useRef<HTMLSelectElement>(null);


  useEffect(() => {  // fetch the initial data and set the state
    const fetchData = async () => {
      try {
        //console.log("Fetching data");
        const data = await fetchBottleData();
        setWineBottles(data);
        setFilteredWineBottles(data)
      } catch {
        //console.log("Error fetching data in useEffect");
      }
    };
    fetchData();

    /* UNBIND JCF FROM SELECT OBJECTS */
    try {
      console.log("Getting JCF Instance");
      
      const selectElement = document.querySelector('select');

      // Get the jcf instance associated with the select element
      // @ts-ignore
      const jcfInstance = jcf.getInstance(selectElement);

      // Check if instance exists and destroy it
      if (jcfInstance) {
        jcfInstance.destroy();
        console.log("Destroying JCF Instance D:<", jcfInstance);
      } else {
        console.log("NO INSTANCE AHHHH");
        
      }
    } catch (error) {
      console.log(error);
    }

  }, [])

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
      <div id="appContainer">
        <h1 style={{ width: '100%', textAlign: 'left', color: '#e9e5d4', height: `${viewportRes.x > 650 ? 0 : 'auto'}`, transform: `${viewportRes.x > 650 ? 'translateY(18px)' : 'none'}` }}>Fairfield Wine Cellar Inventory</h1>
        <div id="toolbarWrapper">
          <div className='filterToolbar'>
            <div>
              <select ref={sortRef} onChange={onSort}>
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
            viewportRes.x <= 650 ?
              <div className='filterToolbar'>
                <WithPopUp viewportRes={viewportRes} title='Country' scrollable={true}>
                  <FilterPanel filters={countries} activeFilters={additionalFiltersCountry} handleFilter={handleFilterCountry} />
                </WithPopUp>
                <WithPopUp viewportRes={viewportRes} title='Wine Type' scrollable={true}>
                  <FilterPanel filters={activeWineTypes} activeFilters={additionalFiltersWineType} handleFilter={handleFilterWineType} />
                </WithPopUp>
              </div> : undefined
          }
        </div>

        <p style={{ color: "#e9e5d4", fontWeight: 500, fontStyle: 'italic', width: '100%', textAlign: 'right', paddingRight: '6px', margin: 0 }}>{filteredWineBottles.length} Results</p>
        <div id="listWrapper">
          {
            viewportRes.x > 650 ?
              <div id='filterWrapper'>
                <WithSidePanel viewportRes={viewportRes} scrollable={true}>
                  <FilterPanel filters={countries} activeFilters={additionalFiltersCountry} handleFilter={handleFilterCountry} />
                </WithSidePanel>
                <WithSidePanel viewportRes={viewportRes} scrollable={true}>
                  <FilterPanel filters={activeWineTypes} activeFilters={additionalFiltersWineType} handleFilter={handleFilterWineType} />
                </WithSidePanel>
              </div> : undefined
          }
          <div id="wineList">
            {filteredWineBottles.length > 0 ? filteredWineBottles.map((bottle, index) => {
              return <>{Number(bottle.Total) > 0 ? <WineCard key={index} bottle={bottle}></WineCard> : undefined}</>
              //return <><WineCard key={index} bottle={bottle}></WineCard></>
            }) : <div style={{ flexDirection: 'column' }} className='wineBottle'><p>No Wine Bottles Found</p><p>{notFoundIcons[Math.floor(Math.random() * 3)]}</p></div>}
          </div>
        </div>
      </div>
    </>
  )
}

export default App
