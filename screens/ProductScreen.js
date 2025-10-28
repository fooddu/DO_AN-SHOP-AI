import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function ProductScreen() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
        </View>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={require('../assets/ao.png')}
            style={styles.productImage}
            resizeMode="contain"
          />
          {/* Pagination Dots */}
          <View style={styles.paginationDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>POLO_GUCCI</Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>$ 50</Text>

            {/* Quantity Controls */}
            <View style={styles.quantityContainer}>
              <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.quantity}>{String(quantity).padStart(2, '0')}</Text>
              <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.rating}>4.5</Text>
            <Text style={styles.reviews}>(50 reviews)</Text>
          </View>

          {/* Description */}
          <Text style={styles.description}>
            Minimal Stand is made of by natural wood. The design that is very
            simple and minimal. This is truly one of the best furnitures in any
            family for now. With 3 different colors, you can easily select the best
            match for your home.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.heartIcon}>🖤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>Add to cart</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Notification Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/notification')}
      >
        <Text style={styles.floatingButtonIcon}>🔔</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>2</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 50,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: '#000',
    fontWeight: '300',
  },
  imageContainer: {
    width: width,
    height: width * 1.2,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: width * 0.8,
    height: width * 0.8,
  },
  paginationDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 30,
    gap: 8,
  },
  dot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d0d0d0',
  },
  dotActive: {
    backgroundColor: '#333',
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: '400',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    minWidth: 30,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  starIcon: {
    fontSize: 22,
    marginRight: 5,
  },
  rating: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginRight: 8,
  },
  reviews: {
    fontSize: 16,
    color: '#999',
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#666',
    textAlign: 'justify',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 15,
  },
  favoriteButton: {
    width: 60,
    height: 60,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 24,
  },
  addToCartButton: {
    flex: 1,
    height: 60,
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  floatingButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    width: 56,
    height: 56,
    backgroundColor: '#2c2c2c',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonIcon: {
    fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});

