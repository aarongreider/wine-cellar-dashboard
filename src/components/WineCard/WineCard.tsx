import { WineBottle } from "../../utils/utils"
import './WineCard.css'

interface cardProps {
    bottle: WineBottle
}

export function WineCard({ bottle }: cardProps) {
    return <>
        <div className="wineBottle">
            <div>
                <h2>{bottle.vintage} {bottle.description}</h2>
                <p>{bottle.country}{bottle.region || bottle.subRegion ? `: ` : undefined}
                    {bottle.region ?
                        `${bottle.region}` : undefined}
                    {bottle.region && bottle.subRegion ? `, ` : undefined}
                    {bottle.subRegion ?
                        `${bottle.subRegion} ` : undefined}</p>
            </div>
            <div>
                <h3>{bottle.ohioRetail ? `$${bottle.ohioRetail}` : 'N/A'}</h3>
                <p>{bottle.total} in stock</p>
            </div>
        </div>
    </>
}