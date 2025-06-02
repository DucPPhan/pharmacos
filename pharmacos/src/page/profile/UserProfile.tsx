import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Avatar, Button, Spin, Modal, Form, Input, DatePicker, Select, Upload, message, Tooltip } from 'antd';
import {
    UserOutlined,
    ShoppingCartOutlined,
    HomeOutlined,
    FileTextOutlined,
    LogoutOutlined,
    EditOutlined,
    CameraOutlined,
    PlusOutlined,
    GiftOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import './UserProfile.css';

const { Sider, Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

interface UserInfo {
    name: string;
    phone: string;
    gender: string;
    birthday?: string;
    avatarUrl?: string;
    email?: string;
    address?: string;
}

// API placeholders for future integration
const fetchUserProfile = async () => {
    // TODO: Call GET /api/user/profile
    // return await axios.get('/api/user/profile');
    return {
        name: 'Nguyễn Thành Đạt',
        phone: '0981657907',
        gender: 'Nam',
        email: 'dat.nguyen@gmail.com',
        birthday: '15/05/1990',
        address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
        avatarUrl: ''
    };
};

const updateUserProfile = async (data: UserInfo) => {
    // TODO: Call PUT /api/user/profile with data
    // return await axios.put('/api/user/profile', data);
    return data;
};

const fetchOrders = async () => {
    // TODO: Call GET /api/user/orders
    return [];
};

const fetchAddresses = async () => {
    // TODO: Call GET /api/user/addresses
    return [];
};

const fetchPrescriptions = async () => {
    // TODO: Call GET /api/user/prescriptions
    return [];
};

const PersonalInfo: React.FC<{
    user: UserInfo,
    onEdit: () => void
}> = ({ user, onEdit }) => (
    <Card
        title={null}
        className="user-profile-card"
        bodyStyle={{ padding: 0 }}
    >
        <div className="user-profile-card-header">
            <Tooltip title="Thông tin cá nhân" placement="bottom">
                <Avatar
                    size={120}
                    src={user.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                    icon={<UserOutlined />}
                    className="user-profile-avatar"
                />
            </Tooltip>
            <div className="user-profile-name">{user.name}</div>
            <div className="user-profile-phone">{user.phone}</div>
        </div>
        <div className="user-profile-card-body">
            <div className="user-profile-row">
                <span className="user-profile-label">Họ và tên</span>
                <span className="user-profile-value">{user.name}</span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Số điện thoại</span>
                <span className="user-profile-value">{user.phone}</span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Email</span>
                <span className="user-profile-value">{user.email || 'Chưa cập nhật'}</span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Giới tính</span>
                <span className="user-profile-value">{user.gender}</span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Ngày sinh</span>
                <span className="user-profile-value">{user.birthday || 'Chưa cập nhật'}</span>
            </div>
            <div className="user-profile-row">
                <span className="user-profile-label">Địa chỉ</span>
                <span className="user-profile-value user-profile-address">{user.address || 'Chưa cập nhật'}</span>
            </div>
            <div className="user-profile-edit-btn-wrap">
                <Button
                    type="primary"
                    shape="round"
                    size="large"
                    icon={<EditOutlined />}
                    className="user-profile-edit-btn"
                    onClick={e => {
                        e.stopPropagation();
                        onEdit();
                    }}
                >
                    Chỉnh sửa thông tin
                </Button>
            </div>
        </div>
    </Card>
);

const EditProfileModal: React.FC<{
    visible: boolean;
    onCancel: () => void;
    onSave: (values: UserInfo) => void;
    user: UserInfo;
}> = ({ visible, onCancel, onSave, user }) => {
    const [form] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '');

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                ...user,
                birthday: user.birthday ? dayjs(user.birthday, 'DD/MM/YYYY') : null
            });
            setAvatarUrl(user.avatarUrl || '');
        }
    }, [visible, user, form]);

    const handleSave = () => {
        form.validateFields()
            .then(values => {
                onSave({
                    ...user,
                    ...values,
                    avatarUrl,
                    birthday: values.birthday ? values.birthday.format('DD/MM/YYYY') : undefined
                });
            })
            .catch(() => { });
    };

    const handleAvatarChange = (info: any) => {
        if (info.file.status === 'done') {
            // This is a placeholder for future API integration
            // In a real app, you would get the URL from the server response
            // For now, we'll use a placeholder URL
            message.success('Tải ảnh lên thành công!');
            setAvatarUrl('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
        } else if (info.file.status === 'error') {
            message.error('Tải ảnh lên thất bại.');
        }
    };

    return (
        <Modal
            title="Chỉnh sửa thông tin cá nhân"
            open={visible}
            onOk={handleSave}
            onCancel={onCancel}
            okText="Lưu thay đổi"
            cancelText="Hủy"
            width={420}
            bodyStyle={{ padding: 24 }}
            centered
            destroyOnClose
            maskClosable={false}
            className="user-profile-modal"
        >
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Upload
                    name="avatar"
                    listType="picture-circle"
                    className="avatar-uploader"
                    showUploadList={false}
                    action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188" // Placeholder URL
                    onChange={handleAvatarChange}
                >
                    {avatarUrl ? (
                        <Avatar
                            size={100}
                            src={avatarUrl}
                            style={{
                                border: '3px solid #1677ff',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                            }}
                        />
                    ) : (
                        <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Tải ảnh</div>
                        </div>
                    )}
                </Upload>
            </div>
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    ...user,
                    birthday: user.birthday ? dayjs(user.birthday, 'DD/MM/YYYY') : null
                }}
                className="user-profile-form"
            >
                <Form.Item
                    name="name"
                    label="Họ và tên"
                    rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                >
                    <Input size="large" placeholder="Nhập họ và tên" />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^\d{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                    ]}
                >
                    <Input size="large" placeholder="Nhập số điện thoại" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input size="large" placeholder="Nhập email" />
                </Form.Item>
                <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                >
                    <Select size="large" placeholder="Chọn giới tính">
                        <Option value="Nam">Nam</Option>
                        <Option value="Nữ">Nữ</Option>
                        <Option value="Khác">Khác</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="birthday"
                    label="Ngày sinh"
                >
                    <DatePicker
                        size="large"
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày sinh"
                        className="user-profile-datepicker"
                    />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                >
                    <TextArea
                        rows={3}
                        size="large"
                        placeholder="Nhập địa chỉ"
                        className="user-profile-textarea"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

const UserProfile: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string>('thongtincanhan');
    const [user, setUser] = useState<UserInfo | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch user profile
    useEffect(() => {
        setLoading(true);
        fetchUserProfile().then((data) => {
            setUser(data);
            setLoading(false);
        });
    }, []);

    const handleMenuClick = (e: any) => {
        if (e.key === 'logout') {
            Modal.confirm({
                title: 'Bạn có chắc chắn muốn đăng xuất?',
                content: 'Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ.',
                okText: 'Đăng xuất',
                cancelText: 'Hủy',
                onOk: () => {
                    // TODO: Call logout API
                    // await axios.post('/api/logout');
                    console.log('Logging out...');
                },
            });
        } else {
            setActiveMenu(e.key);
        }
    };

    const handleSaveProfile = async (values: UserInfo) => {
        setLoading(true);
        // Call update API
        const updated = await updateUserProfile(values);
        setUser(updated);
        setLoading(false);
        setEditModalVisible(false);
        message.success('Cập nhật thông tin thành công!');
    };

    // Prepare for future API data for each section
    // Example: orders, addresses, prescriptions
    // const [orders, setOrders] = useState([]);
    // useEffect(() => { fetchOrders().then(setOrders); }, []);
    // const [addresses, setAddresses] = useState([]);
    // useEffect(() => { fetchAddresses().then(setAddresses); }, []);
    // const [prescriptions, setPrescriptions] = useState([]);
    // useEffect(() => { fetchPrescriptions().then(setPrescriptions); }, []);

    const renderContent = () => {
        if (loading || !user) {
            return (
                <div className="user-profile-loading">
                    <Spin size="large" />
                </div>
            );
        }

        switch (activeMenu) {
            case 'thongtincanhan':
                return (
                    <div className="user-profile-main-content">
                        <PersonalInfo
                            user={user}
                            onEdit={() => setEditModalVisible(true)}
                        />
                        <EditProfileModal
                            visible={editModalVisible}
                            onCancel={() => setEditModalVisible(false)}
                            onSave={handleSaveProfile}
                            user={user}
                        />
                    </div>
                );
            case 'donhang':
                return (
                    <Card
                        title={<span className="user-profile-section-title">Đơn Hàng Của Tôi</span>}
                        className="user-profile-section-card"
                        bodyStyle={{ padding: 0 }}
                    >
                        <div className="user-profile-section-content">
                            <div className="user-profile-section-icon">
                                <GiftOutlined />
                            </div>
                            <div className="user-profile-section-empty-title">Không có đơn hàng nào</div>
                            <div className="user-profile-section-empty-desc">Bạn chưa có đơn hàng nào. Hãy mua sắm ngay để chăm sóc sức khỏe của bạn!</div>
                            <Button
                                type="primary"
                                shape="round"
                                size="large"
                                className="user-profile-section-btn"
                                onClick={() => {
                                    window.location.href = '/';
                                }}
                                icon={<ShoppingCartOutlined />}
                            >
                                Mua sắm ngay
                            </Button>
                        </div>
                    </Card>
                );
            case 'sodiachi':
                return (
                    <Card
                        title={<span className="user-profile-section-title">Sổ địa chỉ</span>}
                        className="user-profile-section-card"
                        bodyStyle={{ padding: 0 }}
                    >
                        <div className="user-profile-section-content">
                            <div className="user-profile-section-icon">
                                <HomeOutlined />
                            </div>
                            <div className="user-profile-section-empty-title">Chưa có địa chỉ nào</div>
                            <div className="user-profile-section-empty-desc">Vui lòng thêm địa chỉ để thuận tiện cho việc đặt hàng và giao thuốc tận nơi</div>
                            <Button
                                type="primary"
                                shape="round"
                                size="large"
                                className="user-profile-section-btn"
                                onClick={() => {
                                    message.info('Chức năng thêm địa chỉ mới!');
                                }}
                                icon={<PlusOutlined />}
                            >
                                Thêm địa chỉ mới
                            </Button>
                        </div>
                    </Card>
                );
            case 'donthuoc':
                return (
                    <Card
                        title={<span className="user-profile-section-title">Đơn Thuốc Của Tôi</span>}
                        className="user-profile-section-card"
                        bodyStyle={{ padding: 0 }}
                    >
                        <div className="user-profile-section-content">
                            <div className="user-profile-section-icon">
                                <MedicineBoxOutlined />
                            </div>
                            <div className="user-profile-section-empty-title">Bạn chưa có đơn thuốc nào</div>
                            <div className="user-profile-section-empty-desc">Tải lên đơn thuốc của bạn để dễ dàng mua thuốc theo toa và theo dõi lịch sử điều trị</div>
                            <Button
                                type="primary"
                                shape="round"
                                size="large"
                                className="user-profile-section-btn"
                                onClick={() => {
                                    message.info('Chức năng tải lên đơn thuốc!');
                                }}
                                icon={<FileTextOutlined />}
                            >
                                Tải lên đơn thuốc
                            </Button>
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <CategoryNav />
            <Layout
                className="user-profile-layout"
            >
                <Layout
                    className="user-profile-inner-layout"
                >
                    <Sider
                        width={340}
                        className="user-profile-sider"
                        breakpoint="lg"
                        collapsedWidth="0"
                    >
                        <div className="user-profile-sider-header">
                            <Tooltip title="Thông tin người dùng" placement="right">
                                <Avatar
                                    size={100}
                                    src={user?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                                    icon={<UserOutlined />}
                                    className="user-profile-sider-avatar"
                                />
                            </Tooltip>
                            <div className="user-profile-sider-name">{user?.name}</div>
                            <div className="user-profile-sider-phone">{user?.phone}</div>
                        </div>
                        <Menu
                            mode="inline"
                            selectedKeys={[activeMenu]}
                            onClick={handleMenuClick}
                            className="user-profile-sider-menu"
                            items={[
                                {
                                    key: 'thongtincanhan',
                                    icon: <UserOutlined style={{ fontSize: 20 }} />,
                                    label: 'Thông tin cá nhân',
                                },
                                {
                                    key: 'donhang',
                                    icon: <ShoppingCartOutlined style={{ fontSize: 20 }} />,
                                    label: 'Đơn hàng của tôi',
                                },
                                {
                                    key: 'sodiachi',
                                    icon: <HomeOutlined style={{ fontSize: 20 }} />,
                                    label: 'Sổ địa chỉ',
                                },
                                {
                                    key: 'donthuoc',
                                    icon: <FileTextOutlined style={{ fontSize: 20 }} />,
                                    label: 'Đơn thuốc của tôi',
                                },
                                {
                                    key: 'logout',
                                    icon: <LogoutOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />,
                                    label: <span className="user-profile-logout-label">Đăng xuất</span>,
                                    danger: true,
                                    style: { marginTop: 12 }
                                },
                            ]}
                        />
                    </Sider>
                    <Content
                        className="user-profile-content"
                    >
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </>
    );
};

export default UserProfile;
