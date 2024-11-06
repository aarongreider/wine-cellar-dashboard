export type WineBottle = {
    description: string,
    vintage: string,
    country: string,
    region: string,
    subRegion: string,
    total: number,
    ohioRetail: number,
}

const endpoints = {
    fairfield: 'https://mobile-api.junglejims.com/fairfield-wine-cellar.json',
    eastgate: 'https://mobile-api.junglejims.com/eastgate-wine-cellar.json',
    local: '../../public/fairfield-wine-cellar.json',
    //github: 'https://aaron.greider.org/wine-cellar-dashboard/dist/fairfield-wine.json'
}

export const fetchBottleData = async (location: string): Promise<WineBottle[]> => {
    try {
        //@ts-ignore
        const response = await fetch(endpoints[`${location}`]);
        //console.log(endpoints.eastgate);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const bottleData = await response.json();
        //console.log(bottleData.wines);

        return bottleData.wines as WineBottle[]
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        throw error; // Ensure the error is propagated if necessary
    }

}

export const filterBottles = (wineBottles: WineBottle[], searchQuery: string): WineBottle[] => {
    // filter bottle list based on query match, runs more frequently
    const cleanQuery = `${searchQuery}`.toLowerCase()
    if (cleanQuery) {
        return wineBottles.filter((bottle) => {
            return (
                `${bottle.vintage} ${bottle.description}`?.toLowerCase().includes(cleanQuery) ||
                `${bottle.country}`?.toLowerCase().includes(cleanQuery) ||
                `${bottle.region}`?.toLowerCase().includes(cleanQuery) ||
                `${bottle.subRegion}`?.toLowerCase().includes(cleanQuery) ||
                `${bottle.ohioRetail}`?.toLowerCase().includes(cleanQuery)
            );
        })
    } else {
        return wineBottles
    }
}

export const filterAdditionalQueries = (wineBottles: WineBottle[], additionalQueries: string[]): WineBottle[] => {
    // a more lightweight version that runs on an array of queries
    //console.log(additionalQueries);

    if (additionalQueries.length > 0) {
        return wineBottles.filter((bottle) => {
            return additionalQueries.some((query) => {
                return (
                    bottle.country?.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().includes(query.toLowerCase()) ||
                    bottle.region?.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().includes(query.toLowerCase()) ||
                    bottle.description?.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().includes(query.toLowerCase())
                );
            });
        });
    } else {
        return wineBottles
    }
}


export const sortBottles = (filteredWineBottles: WineBottle[], sortQuery: string): WineBottle[] => {
    // Sort the filtered array by Vintage year, with undated bottles at the bottom
    const cleanPrice = (price: number): number => {
        // Remove non-numeric characters except periods (.) using a regex
        const cleanedPrice = `${price}`.replace(/[^0-9.]/g, '');
        return cleanedPrice === "" ? 0.0 : parseFloat(cleanedPrice); // Convert cleaned string to a float
    };

    if (sortQuery === '') {
        return filteredWineBottles
    } else {
        let sortedWineBottles: WineBottle[] = filteredWineBottles
        switch (sortQuery) {
            case "year descending":
                {
                    filteredWineBottles.sort((a, b) => {
                        const aYear = Number(a.vintage);
                        const bYear = Number(b.vintage);

                        // If `Vintage` is not a valid number (undated), move it to the bottom
                        if (isNaN(aYear) && !isNaN(bYear)) {
                            return 1; // `a` is undated, move it after `b`
                        } else if (!isNaN(aYear) && isNaN(bYear)) {
                            return -1; // `b` is undated, move it after `a`
                        } else if (isNaN(aYear) && isNaN(bYear)) {
                            return 0; // Both are undated, maintain original order
                        }

                        // Both have valid years, sort in descending order (most recent first)
                        return bYear - aYear;
                    })
                    break;
                }
            case "year ascending":
                {
                    filteredWineBottles.sort((a, b) => {
                        const aYear = Number(a.vintage);
                        const bYear = Number(b.vintage);

                        // If `Vintage` is not a valid number (undated), move it to the bottom
                        if (isNaN(aYear) && !isNaN(bYear)) {
                            return 1; // `a` is undated, move it after `b`
                        } else if (!isNaN(aYear) && isNaN(bYear)) {
                            return -1; // `b` is undated, move it after `a`
                        } else if (isNaN(aYear) && isNaN(bYear)) {
                            return 0; // Both are undated, maintain original order
                        }

                        // Both have valid years, sort in descending order (most recent first)
                        return aYear - bYear;
                    })
                    break;
                }
            case "price ascending":
                {
                    filteredWineBottles.sort((a, b) => {
                        const aPrice = cleanPrice(a.ohioRetail ? a.ohioRetail : 0); // Convert price to number
                        const bPrice = cleanPrice(b.ohioRetail ? b.ohioRetail : 0);

                        return aPrice - bPrice; // Ascending order by Price
                    })
                    break;
                }
            case "price descending":
                {
                    filteredWineBottles.sort((a, b) => {
                        const aPrice = cleanPrice(a.ohioRetail ? a.ohioRetail : 0); // Convert price to number
                        const bPrice = cleanPrice(b.ohioRetail ? b.ohioRetail : 0);

                        return bPrice - aPrice; // Ascending order by Price
                    })
                    break;
                }
            case "alphabetically":
                {
                    filteredWineBottles.sort((a, b) => {
                        return a.description?.localeCompare(b.description);
                    })
                    break;
                }


        }


        return sortedWineBottles
    }
}

export const filterWineTypesByDescriptionAndCountry = (wineBottles: WineBottle[], wineTypes: string[]): string[] => {

    // Create a Set to store wine types that appear in the descriptions or countries
    const matchingWineTypes = new Set<string>();

    // Loop through each wine bottle
    wineBottles.forEach((bottle) => {
        const description = bottle.description?.toLowerCase();
        const region = bottle.region?.toLowerCase();

        // Check each wine type if it's in the description or country
        wineTypes.forEach((wineType) => {
            const wineTypeLower = wineType?.toLowerCase();

            // Add to set if found in either description or country
            if (description?.includes(wineTypeLower) || region?.includes(wineTypeLower)) {
                matchingWineTypes.add(wineType);
            }
        });
    });
    const sortedWineTypes = Array.from(matchingWineTypes).sort((a, b) => {
        return a.localeCompare(b);
    })
    // Return only wine types that matched
    return sortedWineTypes;
};


export const wineTypes = [
    "Cabernet",
    "Merlot",
    "Pinot Noir",
    "Syrah",
    "Shiraz",
    "Zinfandel",
    "Malbec",
    "Grenache",
    "Sangiovese",
    "Tempranillo",
    "Nebbiolo",
    "Barbera",
    "Carmenère",
    "Petit Verdot",
    "Mourvèdre",
    "Montepulciano",
    "Primitivo",
    "Carignan",
    "Cinsault",
    "Tannat",
    "Gamay",
    "Aglianico",
    "Touriga Nacional",
    "Dolcetto",
    "Pinotage",
    "Nero d'Avola",
    "Corvina",
    "Bonarda",
    "Schiava",
    "Teroldego",
    "Chardonnay",
    "Sauvignon Blanc",
    "Riesling",
    "Pinot Grigio",
    "Pinot Gris",
    "Chenin Blanc",
    "Viognier",
    "Semillon",
    "Gewürztraminer",
    "Moscato",
    "Albarino",
    "Torrontes",
    "Grüner Veltliner",
    "Verdelho",
    "Trebbiano",
    "Garganega",
    "Fiano",
    "Vermentino",
    "Cortese",
    "Assyrtiko",
    "Melon de Bourgogne",
    "Marsanne",
    "Roussanne",
    "Verdejo",
    "Picpoul",
    "Silvaner",
    "Palomino",
    "Pinot Blanc",
    "Arneis",
    "Viura",
    "Pedro Ximénez",
    "Rosé",
    "White Zinfandel",
    "Champagne",
    "Prosecco",
    "Cava",
    "Crémant",
    "Franciacorta",
    "Lambrusco",
    "Sekt",
    "Brut Nature",
    "Méthode Cap Classique",
    "Port",
    "Sherry",
    "Sauternes",
    "Tokaji",
    "Ice Wine",
    "Eiswein",
    "Madeira",
    "Muscat",
    "Late Harvest Wines",
    "Vin Santo",
    "Rutherglen Muscat",
    "Marsala",
    "Vermouth",
    "Commandaria",
    "Bordeaux",
    "Super Tuscan",
    "Rioja",
    "Chianti",
    "Brunello di Montalcino",
    "Barolo",
    "Barbaresco",
    "Beaujolais",
    "Valpolicella",
    "Amarone della Valpolicella",
    "Vinho Verde",
    "Châteauneuf-du-Pape",
    "Côtes du Rhône",
    "Cahors",
    "Torrontés",
    "Blaufränkisch",
    "Txakoli",
    "Retsina",
    "Furmint",
    "Saperavi",
    "Cinsault",
    "Bobal",
    "Mavrud",
    "Plavac Mali",
    "Xinomavro",
    "Negroamaro",
    "Agiorgitiko",
    "Falanghina",
    "Godello",
    "Schioppettino",
    "Blauer Portugieser",
    "Tannat",
    "Negrette",
    "Kadarka",
    "Aleatico",
    "Friulano"
];
