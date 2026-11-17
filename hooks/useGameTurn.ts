import { useState } from "react";
import {CoinAnimationData} from "../components/Board/Board";
import {PLAYER_CONFIG, SAFE_CELLS} from "../constants/GameConstants";
import { Coin, useGame } from "../store/GameContext";
import {getCoinPath,getCapturedCoinPath} from "../utils/getCoinPath";
import { getMovableCoins } from "../utils/getMovableCoins";
import {getNextPlayerId} from "../utils/getNextPlayerId";
import { moveCoin } from "../utils/moveCoin";

export default function useGameTurn(){
    const { gameSettings, gameState, setGameState, advancedSettings } = useGame();
    const { phase } = gameState;

    const [lastRoll, setLastRoll] = useState(0);
    const [movableCoins, setMovableCoins] = useState<Coin[]>([]);
    const [movingCoins,setMovingCoins]=useState<CoinAnimationData[]>([]);

    const isComputerPlayer = (playerId: number) => gameSettings.players.find((p) => p.id === playerId)?.isComputer ?? false;

    // Returns the state of the coins after movement
    const commitMove=(coin:Coin,roll:number)=>{
        setGameState((prev)=>{
            const {updatedCoins,extraTurn}=moveCoin(coin,roll,prev);
            if(extraTurn){
                return{...prev,coins:updatedCoins,phase:"rolling"};
            }
            const nextId = getNextPlayerId(gameSettings.players,prev.currentPlayerId);
            return { ...prev, coins:updatedCoins,currentPlayerId: nextId, phase: "rolling" }; 
        });
    };

    const moveCoinResult=(coin:Coin,roll:number,capturedCoin:Coin | null)=>{
        if(capturedCoin){
            setMovingCoins((prev)=>[
                ...prev,
                {
                    coin:capturedCoin,
                    path:getCapturedCoinPath(capturedCoin),
                    color:PLAYER_CONFIG[capturedCoin.playerId].color,
                    isComputer:isComputerPlayer(capturedCoin.playerId),
                    onComplete:()=>{
                        setMovingCoins([]);
                        commitMove(coin,roll);
                    },
                },
            ]);
        }else{
            setMovingCoins([]);
            commitMove(coin,roll);
        }
    };
    
    const startAnimation=(coin:Coin,roll:number)=>{
        const path=getCoinPath(coin,roll);
        const color=PLAYER_CONFIG[coin.playerId].color;
        const isComputer=isComputerPlayer(coin.playerId);

        const {updatedCoins}=moveCoin(coin,roll,gameState);
        const movedCoin=updatedCoins.find(c=>c.playerId===coin.playerId && c.id===coin.id);
        let capturedCoin:Coin | null=null;

        if(movedCoin?.status==="track"){
            const isSafe=SAFE_CELLS.includes(movedCoin.trackIndex);
            if(!isSafe){
                capturedCoin=gameState.coins.find(
                (c)=>c.playerId !== coin.playerId && c.status==="track" && c.trackIndex===movedCoin.trackIndex) ?? null; 
            }
        }
        setMovableCoins([]);

        // Mark coin as status "track" before animating it in the track so that it is not rendered twice
        setGameState(prev=>({...prev,
                            phase:"animating",
                            coins:prev.coins.map(c=>c.playerId===coin.playerId && c.id===coin.id
                                                ? {...c,status:"track" as const,trackIndex:coin.status==="home" ? PLAYER_CONFIG[coin.playerId].startCell:c.trackIndex}
                                                :c
                                                ),
                            }));

        setMovingCoins([{coin,path,color,isComputer,onComplete:()=>moveCoinResult(coin,roll,capturedCoin)}]);
    };
    const handleRoll = (result: number) => {
        setLastRoll(result);

        setGameState((prev) => {
            const movable = getMovableCoins(result, prev, advancedSettings);

            if (movable.length === 0) {
                if (result === 1 || result === 6) {
                
                    // Extra turn roll one or six
                    return { ...prev, phase: "rolling" };
                }

                const nextId = getNextPlayerId(gameSettings.players,prev.currentPlayerId);
                return { ...prev, currentPlayerId: nextId, phase: "rolling" };
            }

            if (movable.length === 1) {
                // Automatically move if only one movable coin
                setTimeout(()=>startAnimation(movable[0],result),0);
                return{...prev,phase:"animating"};
            }

            setMovableCoins(movable);
            return { ...prev, phase: "moving" };
        });
    };

    // Coin press logic
    const handleCoinPress = (coin: Coin) => {
        if (phase !== "moving") return;
        startAnimation(coin, lastRoll);
    };

    return {movableCoins,movingCoins,handleRoll,handleCoinPress};
}