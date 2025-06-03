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
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import './UserProfile.css';
import CategoryNav from '../home/CategoryNav';

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
    skinType?: string;
}
// đơn hàng
const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:10000/api/customers/orders', {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
    if (!res.ok) {
        const errText = await res.text();
        console.error('API orders error:', errText);
        return [];
    }
    return await res.json();
};


// lịch sử mua hàng
const fetchPurchaseHistory = async () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'customer';
    if (role !== 'customer') return [];
    const res = await fetch('http://localhost:10000/api/customers/purchase-history', {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
    if (!res.ok) {
        const errText = await res.text();
        console.error('API purchase history error:', errText);
        return [];
    }
    return await res.json();
};

const PersonalInfo: React.FC<{
    user: UserInfo,
    onEdit: () => void,
    onChangePassword: () => void
}> = ({ user, onEdit, onChangePassword }) => (
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
                <span className="user-profile-value">{user.phone || 'Chưa cập nhật'}</span>
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
            <div className="user-profile-edit-btn-wrap" style={{ gap: 16 }}>
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
                <Button
                    shape="round"
                    size="large"
                    className="user-profile-edit-btn"
                    style={{ background: '#fff', color: '#7494ec', border: '1px solid #7494ec' }}
                    onClick={e => {
                        e.stopPropagation();
                        onChangePassword();
                    }}
                >
                    Đổi mật khẩu
                </Button>
            </div>
        </div>
    </Card>
);

const nameRegex = /^[a-zA-ZÀ-ỹ\s'.-]+$/u;
const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;

const EditProfileInlineForm: React.FC<{
    user: UserInfo;
    onCancel: () => void;
    onSave: (values: UserInfo) => void;
}> = ({ user, onCancel, onSave }) => {
    const [form] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState<string>(user.avatarUrl || '');

    useEffect(() => {
        form.setFieldsValue({
            ...user,
            birthday: user.birthday ? dayjs(user.birthday, 'DD/MM/YYYY') : null
        });
        setAvatarUrl(user.avatarUrl || '');
    }, [user, form]);

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
            message.success('Tải ảnh lên thành công!');
            setAvatarUrl('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
        } else if (info.file.status === 'error') {
            message.error('Tải ảnh lên thất bại.');
        }
    };

    return (
        <Card
            title={null}
            className="user-profile-card"
            bodyStyle={{ padding: 0 }}
        >
            <div className="user-profile-card-header">
                <Tooltip title="Thông tin cá nhân" placement="bottom">
                    <Upload
                        name="avatar"
                        listType="picture-circle"
                        className="avatar-uploader"
                        showUploadList={false}
                        action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                        onChange={handleAvatarChange}
                    >
                        <Avatar
                            size={120}
                            src={avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                            icon={<UserOutlined />}
                            className="user-profile-avatar"
                            style={{
                                border: '3px solid #1677ff',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                            }}
                        />
                    </Upload>
                </Tooltip>
                <div className="user-profile-name">{user.name}</div>
                <div className="user-profile-phone">{user.phone}</div>
            </div>
            <div className="user-profile-card-body">
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
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên!' },
                            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
                            {
                                pattern: nameRegex,
                                message: 'Họ và tên không hợp lệ!'
                            },
                            {
                                validator: (_, value) => {
                                    if (value && /^\d+$/.test(value)) {
                                        return Promise.reject('Họ và tên không hợp lệ!');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input size="large" placeholder="Nhập họ và tên" />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            {
                                pattern: phoneRegex,
                                message: 'Số điện thoại không hợp lệ!'
                            }
                        ]}
                    >
                        <Input size="large" placeholder="Nhập số điện thoại" maxLength={10} />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
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
                            <Option value="male">Nam</Option>
                            <Option value="female">Nữ</Option>
                            <Option value="Khác">Khác</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="birthday"
                        label="Ngày sinh"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày sinh!' },
                            {
                                validator: (_, value) => {
                                    if (value && value.isAfter(dayjs(), 'day')) {
                                        return Promise.reject('Ngày sinh không hợp lệ!');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <DatePicker
                            size="large"
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            placeholder="Chọn ngày sinh"
                            className="user-profile-datepicker"
                            disabledDate={current => current && current > dayjs().endOf('day')}
                        />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[
                            { required: true, message: 'Vui lòng nhập địa chỉ!' },
                            { min: 5, message: 'Địa chỉ phải có ít nhất 5 ký tự!' }
                        ]}
                    >
                        <TextArea
                            rows={3}
                            size="large"
                            placeholder="Nhập địa chỉ"
                            className="user-profile-textarea"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginTop: 32, textAlign: 'center' }}>
                        <Button
                            type="primary"
                            shape="round"
                            size="large"
                            style={{ marginRight: 16, minWidth: 120, color: '#fff', backgroundColor: '#1677ff', borderColor: '#1677ff' }}
                            onClick={handleSave}
                        >
                            Lưu thay đổi
                        </Button>
                        <Button
                            shape="round"
                            size="large"
                            onClick={onCancel}
                            style={{ minWidth: 100 }}
                        >
                            Hủy
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Card>
    );
};

const ChangePasswordForm: React.FC<{
    onCancel: () => void;
    onSuccess: () => void;
}> = ({ onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const { oldPassword, newPassword } = await form.validateFields();
            setLoading(true);
            await changePassword(oldPassword, newPassword);
            setLoading(false);
            message.success('Đổi mật khẩu thành công!');
            onSuccess();
        } catch (err: any) {
            setLoading(false);
            message.error(err.message || 'Đổi mật khẩu thất bại!');
        }
    };

    return (
        <Card
            title={null}
            className="user-profile-card"
            bodyStyle={{ padding: 0 }}
        >
            <div className="user-profile-card-header">
                <Avatar
                    size={120}
                    src={'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                    icon={<UserOutlined />}
                    className="user-profile-avatar"
                />
                <div className="user-profile-name">Đổi mật khẩu</div>
            </div>
            <div className="user-profile-card-body">
                <Form
                    form={form}
                    layout="vertical"
                    className="user-profile-form"
                >
                    <Form.Item
                        name="oldPassword"
                        label="Mật khẩu cũ"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu cũ!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password size="large" placeholder="Nhập mật khẩu cũ" />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    if (form.getFieldValue('oldPassword') && value === form.getFieldValue('oldPassword')) {
                                        return Promise.reject('Mật khẩu mới phải khác mật khẩu cũ!');
                                    }
                                    return Promise.resolve();
                                }
                            }
                        ]}
                    >
                        <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            {
                                validator: (_, value) => {
                                    if (!value || form.getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject('Mật khẩu xác nhận không khớp!');
                                }
                            }
                        ]}
                    >
                        <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>
                    <Form.Item style={{ marginTop: 32, textAlign: 'center' }}>
                        <Button
                            shape="round"
                            size="large"
                            onClick={onCancel}
                            style={{ minWidth: 100, marginRight: 16, width: 120, height: 40 }}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            shape="round"
                            size="large"
                            className="user-profile-edit-btn"
                            onClick={e => {
                                e.stopPropagation();
                                handleSubmit();
                            }}
                        >
                            Đổi Mật Khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Card>
    );
};

// Hàm lấy role từ localStorage 
const getUserRole = () => {
    return localStorage.getItem('role') || 'customer';
};

// Hàm fetch profile động theo role, truyền token vào header Authorization
const fetchProfileByRole = async (): Promise<UserInfo> => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user.role;
    const token = localStorage.getItem('token');
    let url = '';
    if (role === 'staff') {
        url = 'http://localhost:10000/api/staff/profile';
    } else {
        url = 'http://localhost:10000/api/customers/profile';
    }
    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
    if (!res.ok) {
        const errText = await res.text();
        console.error('API error:', errText);
        throw new Error('Không lấy được thông tin người dùng');
    }
    const data = await res.json();

    return {
        name: data.name || data.fullName || '',
        phone: data.phone || data.phoneNumber || '',
        gender: data.gender === 'male' ? 'Nam' : data.gender === 'female' ? 'Nữ' : (data.gender || ''),
        birthday: data.dateOfBirth
            ? dayjs(data.dateOfBirth).format('DD/MM/YYYY')
            : (data.birthday || ''),
        avatarUrl: data.avatarUrl || '',
        email: data.email || '',
        address: data.address || '',
    };
};

// Hàm update profile động theo role
const updateProfileByRole = async (data: UserInfo): Promise<UserInfo> => {
    const role = localStorage.getItem('role') || 'customer';
    const token = localStorage.getItem('token');
    let url = '';
    let body: any = {};
    let method = 'PATCH';

    if (role === 'staff') {
        url = 'http://localhost:10000/api/staff/profile';
        body = {
            name: data.name,
            email: data.email,
        };
        method = 'PATCH';
    } else {
        url = 'http://localhost:10000/api/customers/profile';
        body = {
            name: data.name,
            gender: data.gender === 'Nam' ? 'male' : data.gender === 'Nữ' ? 'female' : data.gender,
            dateOfBirth: data.birthday ? dayjs(data.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
        };
        method = 'PATCH';
    }

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const errText = await res.text();
        console.error('API update error:', errText);
        throw new Error('Cập nhật thông tin thất bại!');
    }
    return await fetchProfileByRole();
};

// API đổi mật khẩu động cho customer và staff (không giả lập, luôn gọi API nếu có endpoint)
const changePassword = async (oldPassword: string, newPassword: string) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') || 'customer';
    let url = '';
    let body: any = {};
    let method = 'PUT';

    if (role === 'customer') {
        url = 'http://localhost:10000/api/customers/change-password';
        body = {
            currentPassword: oldPassword,
            newPassword: newPassword
        };
        method = 'PUT';
    } else if (role === 'staff') {
        url = 'http://localhost:10000/api/staff/change-password';
        body = {
            currentPassword: oldPassword,
            newPassword: newPassword
        };
        method = 'PUT';
    } else {
        throw new Error('Không hỗ trợ đổi mật khẩu cho loại tài khoản này!');
    }

    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errText = await res.text();
        console.error('API change password error:', errText);
        throw new Error('Đổi mật khẩu thất bại!');
    }
    return { success: true };
};

const UserProfile: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string>(() => localStorage.getItem('profileActiveMenu') || 'thongtincanhan');
    const [user, setUser] = useState<UserInfo | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        setLoading(true);
        fetchProfileByRole()
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                message.error('Không lấy được thông tin người dùng!');
            });
    }, []);

    useEffect(() => {
        if (activeMenu === 'donhang') {
            fetchOrders().then(setOrders);
        }
        if (activeMenu === 'donthuoc') {
            fetchPurchaseHistory().then(setPurchaseHistory);
        }
    }, [activeMenu]);

    // Khi đổi tab, lưu vào localStorage để giữ trạng thái khi F5
    const handleMenuClick = (e: any) => {
        if (e.key === 'logout') {
            Modal.confirm({
                title: 'Bạn có chắc chắn muốn đăng xuất?',
                content: 'Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ.',
                okText: <span style={{ color: '#fff', fontWeight: 700 }}>Đăng xuất</span>,
                cancelText: 'Hủy',
                okButtonProps: {
                    style: {
                        background: 'linear-gradient(90deg, #1677ff 0%, #7494ec 100%)',
                        border: 'none',
                        fontWeight: 700,
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(22,119,255,0.18)',
                    }
                },
                cancelButtonProps: {
                    style: {
                        borderRadius: 8
                    }
                },
                onOk: () => {
                    // TODO: Call logout API
                    // await axios.post('/api/logout');
                    console.log('Logging out...');
                },
            });
        } else {
            setActiveMenu(e.key);
            localStorage.setItem('profileActiveMenu', e.key);
        }
    };

    const handleSaveProfile = async (values: UserInfo) => {
        setLoading(true);
        try {
            const updated = await updateProfileByRole(values);
            setUser(updated);
            setEditMode(false);
            message.success('Cập nhật thông tin thành công!');
        } catch (err: any) {
            message.error(err.message || 'Cập nhật thông tin thất bại!');
        }
        setLoading(false);
    };

    const renderOrders = () => {
        if (!orders || orders.length === 0) {
            return (
                <div>
                    <div className="user-profile-section-empty-title">Không có đơn hàng nào</div>
                    <div className="user-profile-section-empty-desc">Bạn chưa có đơn hàng nào.</div>
                </div>
            );
        }
        return (
            <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: '#7494ec' }}>Đơn hàng của tôi</div>
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                    {orders.map((item, idx) => (
                        <Card
                            key={item.id || idx}
                            style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #f0f0f0' }}
                            bodyStyle={{ padding: 16 }}
                        >
                            <div style={{ fontWeight: 500, fontSize: 16 }}>
                                Đơn #{item.id || idx + 1}
                            </div>
                            <div>Ngày đặt: {item.date ? dayjs(item.date).format('DD/MM/YYYY') : '---'}</div>
                            <div>Tổng tiền: {item.total ? item.total.toLocaleString() + '₫' : '---'}</div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

    const renderPurchaseHistory = () => {
        if (!purchaseHistory || purchaseHistory.length === 0) {
            return (
                <div>
                    <div className="user-profile-section-empty-title">Không có lịch sử mua hàng</div>
                    <div className="user-profile-section-empty-desc">Bạn chưa có lịch sử mua hàng nào.</div>
                </div>
            );
        }
        return (
            <div style={{ marginTop: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, color: '#7494ec' }}>Lịch sử mua hàng</div>
                <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                    {purchaseHistory.map((item, idx) => (
                        <Card
                            key={item.id || idx}
                            style={{ marginBottom: 16, borderRadius: 12, border: '1px solid #f0f0f0' }}
                            bodyStyle={{ padding: 16 }}
                        >
                            <div style={{ fontWeight: 500, fontSize: 16 }}>
                                Đơn #{item.id || idx + 1}
                            </div>
                            <div>Ngày mua: {item.date ? dayjs(item.date).format('DD/MM/YYYY') : '---'}</div>
                            <div>Tổng tiền: {item.total ? item.total.toLocaleString() + '₫' : '---'}</div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    };

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
                        {!editMode && !changePasswordMode ? (
                            <PersonalInfo
                                user={user}
                                onEdit={() => setEditMode(true)}
                                onChangePassword={() => setChangePasswordMode(true)}
                            />
                        ) : editMode ? (
                            <EditProfileInlineForm
                                user={user}
                                onCancel={() => setEditMode(false)}
                                onSave={handleSaveProfile}
                            />
                        ) : (
                            <ChangePasswordForm
                                onCancel={() => setChangePasswordMode(false)}
                                onSuccess={() => setChangePasswordMode(false)}
                            />
                        )}
                    </div>
                );
            case 'donhang':
                return (
                    <Card
                        title={<span className="user-profile-section-title">Đơn Hàng Của Tôi</span>}
                        className="user-profile-section-card"
                        bodyStyle={{ padding: 0 }}
                        style={{ maxWidth: 520, margin: '0 auto' }}
                    >
                        <div className="user-profile-section-content">
                            <div className="user-profile-section-icon">
                                <GiftOutlined />
                            </div>
                            {renderOrders()}
                            <Button
                                type="primary"
                                shape="round"
                                size="large"
                                className="user-profile-section-btn"
                                onClick={() => {
                                    window.location.href = '/';
                                }}
                                icon={<ShoppingCartOutlined />}
                                style={{ marginTop: 24 }}
                            >
                                Mua sắm ngay
                            </Button>
                        </div>
                    </Card>
                );
            case 'donthuoc':
                return (
                    <Card
                        title={<span className="user-profile-section-title">Lịch Sử Mua Hàng</span>}
                        className="user-profile-section-card"
                        bodyStyle={{ padding: 0 }}
                        style={{ maxWidth: 520, margin: '0 auto' }}
                    >
                        <div className="user-profile-section-content">
                            <div className="user-profile-section-icon">
                                <GiftOutlined />
                            </div>
                            {renderPurchaseHistory()}
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
                                    key: 'donthuoc',
                                    icon: <FileTextOutlined style={{ fontSize: 20 }} />,
                                    label: 'Lịch Sử Mua Hàng',
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

