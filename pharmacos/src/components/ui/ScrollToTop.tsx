import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
    // Lấy thông tin về địa chỉ hiện tại
    const { pathname } = useLocation();

    // Sử dụng useEffect để thực hiện một hành động mỗi khi `pathname` thay đổi
    useEffect(() => {
        // Cuộn cửa sổ lên vị trí (0, 0) - tức là đầu trang
        window.scrollTo(0, 0);
    }, [pathname]); // Mảng phụ thuộc chứa `pathname`, effect sẽ chạy lại khi pathname thay đổi

    // Component này không render ra bất kỳ giao diện nào
    return null;
};

export default ScrollToTop;