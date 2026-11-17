import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {BackHandler,StyleSheet,View} from "react-native";
import Board from "../components/Board/Board";
import CloseButton from "../components/common/CloseButton";
import ConfirmModal from "../components/common/ConfirmModal";
import Dice from "../components/Dice/Dice";
import Colors from "../constants/Colors";
import useGameTurn from "../hooks/useGameTurn";
import { useGame } from "../store/GameContext";

export default function GameScreen() {
  const { gameSettings, gameState } = useGame();
  const { currentPlayerId, phase } = gameState;

  const {movableCoins, movingCoins,handleRoll,handleCoinPress} = useGameTurn();
  const [confirmExit,setConfirmExit]=useState(false);

  const currentPlayer = gameSettings.players.find((p) => p.id === currentPlayerId);
  const isComputerTurn = currentPlayer?.isComputer ?? false;

  useFocusEffect(
    useCallback(() => {
      const backPress = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          setConfirmExit(true);
          return true;
        },
      );
      return () => backPress.remove();
    }, []),
  );

  return (
    <View style={styles.screen}>

      {/* Close Button */}
      <CloseButton onPress={() => setConfirmExit(true)} />

      <View style={styles.boardArea}>
        <Board  currentPlayerId={currentPlayerId}
                movableCoins={movableCoins}
                onCoinPress={handleCoinPress}
                animatingCoins={movingCoins}
        />
      </View>

      <Dice onRoll={handleRoll}
            isComputerTurn={isComputerTurn}
            disabled={isComputerTurn || phase === "moving" || phase === "animating"}
            currentPlayerId={currentPlayerId}
      />

      <ConfirmModal visible={confirmExit}
                    title="Quit Game?"
                    body="Your current game will be terminated."
                    buttons={[
                      {
                        label:"Quit",
                        style:"destructive",
                        onPress:()=>{
                          setConfirmExit(false);
                          router.back();
                        },
                      },
                      {label:"Keep playing", style:"cancel",onPress:()=>setConfirmExit(false) },
                    ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ui.appBg,
  },
  boardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
})