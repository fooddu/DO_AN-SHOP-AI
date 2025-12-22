// File: components/ConfirmModal.js

import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
    primary: '#FF3366',
    overlay: 'rgba(0,0,0,0.5)',
    white: '#fff',
    text: '#2D3436',
    muted: '#888',
    cancelBg: '#F0F0F0',
};

export default function ConfirmModal({ 
    visible, 
    title, 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "Đồng ý", 
    cancelText = "Hủy bỏ",
    loading = false
}) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel} // Để tắt khi bấm nút Back trên Android
        >
            <View style={styles.centeredView}>
                {/* Lớp nền mờ */}
                <View style={styles.overlay} />

                {/* Hộp thoại chính */}
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>{title}</Text>
                    <Text style={styles.modalText}>{message}</Text>

                    <View style={styles.buttonRow}>
                        {/* Nút Hủy */}
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonCancel]} 
                            onPress={onCancel}
                            disabled={loading}
                        >
                            <Text style={styles.textCancel}>{cancelText}</Text>
                        </TouchableOpacity>

                        {/* Nút Đồng ý */}
                        <TouchableOpacity 
                            style={[styles.button, styles.buttonConfirm, loading && { opacity: 0.7 }]} 
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            <Text style={styles.textConfirm}>
                                {loading ? "Đang xử lý..." : confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.overlay,
    },
    modalView: {
        width: '85%',
        maxWidth: 400,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 15,
        color: COLORS.muted,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 12,
    },
    button: {
        borderRadius: 12,
        padding: 14,
        elevation: 2,
        flex: 1,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: COLORS.cancelBg,
    },
    buttonConfirm: {
        backgroundColor: COLORS.primary,
    },
    textCancel: {
        color: COLORS.text,
        fontWeight: '600',
        fontSize: 15,
    },
    textConfirm: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
});