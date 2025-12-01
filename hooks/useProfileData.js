// File: hooks/useProfileData.js 
// Đặt trong thư mục ../hooks/

import { useEffect, useState } from 'react';
import client from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const useProfileData = () => {
    const { user, token } = useAuth();
    
    // States cho Dữ liệu
    const [orderCount, setOrderCount] = useState(0);
    const [addressCount, setAddressCount] = useState(0);
    const [cardCount, setCardCount] = useState(0); 

    // States cho Trạng thái tải
    const [isCounting, setIsCounting] = useState(true);

    // Hàm chung để lấy headers
    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${token}` }
    });

    // 1. Fetch số lượng Đơn hàng (GET /orders/count)
    const fetchOrderCountAPI = async () => {
        if (!token) return 0;
        try {
            console.log("-> Đang fetch /orders/count...");
            const response = await client.get('/orders/count', getAuthHeaders());
            const count = response.data?.count || 0;
            console.log(`✅ [DEBUG HOOK] /orders/count: Thành công, Count = ${count}`);
            return count;
        } catch (e) { 
            const errorMsg = e.response?.data?.message || e.message || "Lỗi không xác định";
            console.error(`❌ [DEBUG HOOK] Lỗi API /orders/count (Status: ${e.response?.status || 'N/A'}):`, errorMsg);
            return 0; 
        }
    };

    // 2. Fetch số lượng Địa chỉ (GET /addresses/count)
    const fetchAddressCountAPI = async () => {
        if (!token) return 0;
        try {
            console.log("-> Đang fetch /addresses/count...");
            const response = await client.get('/addresses/count', getAuthHeaders());
            const count = response.data?.count || 0;
            console.log(`✅ [DEBUG HOOK] /addresses/count: Thành công, Count = ${count}`);
            return count;
        } catch (e) { 
            const errorMsg = e.response?.data?.message || e.message || "Lỗi không xác định";
            console.error(`❌ [DEBUG HOOK] Lỗi API /addresses/count (Status: ${e.response?.status || 'N/A'}):`, errorMsg);
            return 0; 
        }
    };
    
    // 3. Fetch số lượng Thẻ/Payment Methods (Mockup)
    const fetchCardCountAPI = async () => {
        await new Promise(resolve => setTimeout(resolve, 500)); 
        return 2;
    };

    // --- EFFECT CHÍNH ---

    useEffect(() => {
        if (!user || !token) {
            console.log("[DEBUG HOOK] 🚫 User hoặc Token không tồn tại. Bỏ qua Load Counts.");
            setIsCounting(false);
            return;
        }
        
        console.log("[DEBUG HOOK] 🔄 Bắt đầu tải các Counts cho Profile...");

        const loadAllCounts = async () => {
            setIsCounting(true);
            
            // Chạy tất cả các promises song song
            const results = await Promise.all([
                fetchOrderCountAPI(),
                fetchAddressCountAPI(),
                fetchCardCountAPI(),
            ]);

            // Cập nhật trạng thái
            setOrderCount(results[0]);
            setAddressCount(results[1]);
            setCardCount(results[2]);
            
            console.log("[DEBUG HOOK] ✅ Tải Counts Hoàn tất.");
            setIsCounting(false);
        };

        loadAllCounts();
    }, [user, token]);

    return {
        orderCount,
        addressCount,
        cardCount,
        isCounting,
    };
};

export default useProfileData;