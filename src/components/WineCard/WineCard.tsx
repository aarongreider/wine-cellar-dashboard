import { WineBottle } from "../../utils/utils"
import './WineCard.css'

interface cardProps {
    bottle: WineBottle
}
export function WineCard({ bottle }: cardProps) {
    return <>
        <div className="wineBottle">
            <div>
                <h2>{bottle.Vintage} {bottle.Description}</h2>
                <p>{bottle.Country}{bottle.Region || bottle.SubRegion ? `: ` : undefined}
                    {bottle.Region ?
                        `${bottle.Region}` : undefined}
                    {bottle.Region && bottle.SubRegion ? `, ` : undefined}
                    {bottle.SubRegion ?
                        `${bottle.SubRegion} ` : undefined}</p>
            </div>
            <div>
                <h3>${bottle.OhioRetail}</h3>
                <p>{bottle.Total} in stock</p>
            </div>
        </div>
    </>
}