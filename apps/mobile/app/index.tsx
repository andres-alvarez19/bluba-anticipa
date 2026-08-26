import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Bluba Anticipa</Text>
      <Text style={styles.body}>Estado inicial del MVP mobile.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f7faf9"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#18332f"
  },
  body: {
    marginTop: 8,
    fontSize: 16,
    color: "#47615d"
  }
});
