import {Player} from "../store/GameContext";

export function getNextPlayerId(players:Player[],currentId:number): number{
    const ids = players.map((p)=>p.id);
    const idx = ids.indexOf(currentId);
    return ids[(idx+1) % ids.length];
}