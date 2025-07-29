import { View, Text, Image, StyleSheet } from "react-native"

const ProductInfoSection = ({ product }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>${product.price}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  imageContainer: {
    flex: 1,
    maxWidth: 150,
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
  },
  infoContainer: {
    flex: 2,
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    marginTop: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
  },
})

export default ProductInfoSection
