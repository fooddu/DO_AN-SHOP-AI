import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ShippingForm = ({ info, setInfo, title = "Thông tin giao hàng" }) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
            {/* Icon bút chì giả lập nút sửa */}
            <Ionicons name="create-outline" size={20} color="#888" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Tên người nhận"
        value={info.recipientName}
        onChangeText={(text) => setInfo({...info, recipientName: text})}
      />
      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={info.phoneNumber}
        onChangeText={(text) => setInfo({...info, phoneNumber: text})}
        keyboardType="phone-pad"
      />
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        placeholder="Địa chỉ (Số nhà, đường, phường/xã...)"
        value={info.address}
        onChangeText={(text) => setInfo({...info, address: text})}
        multiline
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 20,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, 
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 12, 
    backgroundColor: '#FAFAFA', 
  },
});

export default ShippingForm;