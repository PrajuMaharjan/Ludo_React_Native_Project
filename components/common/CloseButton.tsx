import {StyleSheet,Text,TouchableOpacity} from "react-native";
import Colors from "../../constants/Colors";

type CloseButtonProps={
    onPress?:()=>void;
};

export default function CloseButton({onPress}:CloseButtonProps){
    return(
        <TouchableOpacity onPress={onPress} style={styles.btn}>
            <Text style={styles.btnText}>✕</Text>
        </TouchableOpacity>
    );
}

const styles=StyleSheet.create({
    btn: {
        position: "absolute",
        top: 48,
        left: 8,
        zIndex: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor:"rgba()255,255,255,0.1",
        alignItems:"center",
        justifyContent:"center",
    },
    btnText: {
        color: Colors.ui.textMuted,
        fontSize: 14,
        fontWeight: "bold",
    },
});