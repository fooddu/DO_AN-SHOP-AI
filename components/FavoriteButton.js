import { TouchableOpacity } from 'react-native';
// We will use the heart icon from 'expo-vector-icons'
import { Ionicons } from '@expo/vector-icons';
// Import hook from FavoritesContext you just created
import { useFavorites } from '../contexts/FavoritesContext';

// This component only needs to receive 2 props:
// 1. productId: To know which product is being manipulated
// 2. size: (Optional) Icon size
export default function FavoriteButton({ productId, size = 30 }) {
    // Get 2 important functions from context
    const { isFavorited, toggleFavorite } = useFavorites();

    // Check if this product is already favorited
    const favorited = isFavorited(productId);

    // Call toggle function when user presses the button
    const handlePress = () => {
        toggleFavorite(productId);
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <Ionicons
                // If 'favorited' -> show "heart" icon (filled)
                // If not -> show "heart-outline" icon (outline)
                name={favorited ? "heart" : "heart-outline"}
                size={size}
                // If 'favorited' -> red color
                // If not -> black color
                color={favorited ? "#FF0000" : "#000000"}
            />
        </TouchableOpacity>
    );
}
