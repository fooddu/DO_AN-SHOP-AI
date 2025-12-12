import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Platform } from 'react-native'; // 1. Import Platform

// Các bản dịch.
const resources = {
  en: {
    translation: {
      'shipping_info': 'Shipping Information',
      'recipient_name': 'Recipient Name',
      'address': 'Address',
      'phone_number': 'Phone Number',
      'payment_method': 'Payment Method',
      'order_summary': 'Order Summary',
      'order_subtotal': 'Order Subtotal',
      'delivery_fee': 'Delivery Fee',
      'total_amount': 'Total:',
      'place_order': 'PLACE ORDER',
      
      // Alerts & Errors
      'empty_cart_alert': 'Your cart is empty!',
      'fill_info_alert': 'Please fill in all shipping information!',
      'login_expired_alert': 'Login session expired. Please log in again.',
      'error_title': 'Error',
      'loading': 'Loading...',
      'server_error': 'Unknown server error.',
      'connection_error': 'Connection error or server failure.',
      
      // Keys cho Notifications
      'order_confirmed': 'Order #{{orderId}} confirmed!',
      'order_processing': 'Order valued at ${{total}} is being processed.',
      'order_shipped': 'Order #{{orderId}} has been shipped.',
      'order_delivered': 'Order #{{orderId}} has been delivered. Enjoy!',
    },
  },
  vi: {
    translation: {
      'shipping_info': 'Thông tin giao hàng',
      'recipient_name': 'Tên người nhận',
      'address': 'Địa chỉ',
      'phone_number': 'Số điện thoại',
      'payment_method': 'Phương thức thanh toán',
      'order_summary': 'Tóm tắt đơn hàng',
      'order_subtotal': 'Đơn hàng',
      'delivery_fee': 'Phí giao hàng',
      'total_amount': 'Tổng cộng:',
      'place_order': 'ĐẶT HÀNG',
      
      // Alerts & Errors
      'empty_cart_alert': 'Giỏ hàng của bạn đang trống!',
      'fill_info_alert': 'Vui lòng điền đầy đủ thông tin giao hàng!',
      'login_expired_alert': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
      'error_title': 'Lỗi',
      'loading': 'Đang tải...',
      'server_error': 'Lỗi máy chủ không xác định.',
      'connection_error': 'Lỗi kết nối hoặc máy chủ.',
      
      // Keys cho Notifications
      'order_confirmed': 'Đơn hàng #{{orderId}} đã được xác nhận!',
      'order_processing': 'Đơn hàng trị giá ${{total}} đang được xử lý.',
      'order_shipped': 'Đơn hàng #{{orderId}} đã được giao cho đơn vị vận chuyển.',
      'order_delivered': 'Đơn hàng #{{orderId}} đã giao thành công. Chúc bạn ngon miệng!',
    },
  },
};

const getLanguage = async () => {
  try {
    // 2. FIX QUAN TRỌNG: Kiểm tra môi trường Server (SSR)
    // Nếu đang chạy trên Web VÀ không có window (môi trường Node/Server), trả về mặc định ngay
    if (Platform.OS === 'web' && typeof window === 'undefined') {
        return 'en';
    }

    const storedLng = await AsyncStorage.getItem('app_language');
    if (storedLng) return storedLng;
    
    // Nếu không có trong storage, lấy ngôn ngữ máy
    // Localization.locale trả về dạng 'vi-VN' hoặc 'en-US'
    const deviceLng = Localization.getLocales ? Localization.getLocales()[0].languageCode : Localization.locale;
    
    return deviceLng.includes('vi') ? 'vi' : 'en';
  } catch (error) {
    console.warn("Could not retrieve language from storage:", error);
    return 'en';
  }
};

const initI18n = async () => {
    // Lấy ngôn ngữ (có thể mất chút thời gian do async)
    const initialLng = await getLanguage();

    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: initialLng,
        fallbackLng: 'en', 
        ns: ['translation'],
        defaultNS: 'translation',
        interpolation: {
          escapeValue: false,
        },
        compatibilityJSON: 'v3',
        react: {
            useSuspense: false // Tắt suspense để tránh lỗi trên Android cũ
        }
      });
};

// Gọi hàm khởi tạo
initI18n(); 

export default i18n;