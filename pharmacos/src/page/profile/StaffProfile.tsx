import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Avatar, Button, Spin, Modal, message, Tooltip, Form, Input, DatePicker, Select } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    EditOutlined,
    CaretLeftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './UserProfile.css';
import CategoryNav from '../home/CategoryNav';
import { Sidebar } from "@/components/ui/sidebar"; // Thêm dòng này
import { useMediaQuery } from "@/hooks/use-media-query"; // Thêm nếu muốn sidebar responsive
import { cn } from "@/lib/utils"; // Thêm nếu muốn dùng classnames như DashboardLayout

const { Sider, Content } = Layout;

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

const fetchStaffProfile = async (): Promise<UserInfo> => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:10000/api/staff/profile', {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
    if (!res.ok) {
        if (res.status === 401) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }
        throw new Error('Không lấy được thông tin nhân viên');
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

const updateStaffProfile = async (data: UserInfo): Promise<UserInfo> => {
    const token = localStorage.getItem('token');
    const url = 'http://localhost:10000/api/staff/profile';
    const body = {
        name: data.name,
        email: data.email,
        gender: data.gender === 'Nam' ? 'male' : data.gender === 'Nữ' ? 'female' : data.gender,
        dateOfBirth: data.birthday ? dayjs(data.birthday, 'DD/MM/YYYY').format('YYYY-MM-DD') : undefined,
        address: data.address,
    };
    const res = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Cập nhật thông tin thất bại!');
    }
    return await fetchStaffProfile();
};

const changeStaffPassword = async (oldPassword: string, newPassword: string) => {
    const token = localStorage.getItem('token');
    const url = 'http://localhost:10000/api/staff/change-password';
    const body = {
        currentPassword: oldPassword,
        newPassword: newPassword
    };
    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Đổi mật khẩu thất bại!');
    }
    return { success: true };
};

const { Option } = Select;
const { TextArea } = Input;

const StaffPersonalInfo: React.FC<{
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

const StaffEditProfileForm: React.FC<{
    user: UserInfo;
    onCancel: () => void;
    onSave: (values: UserInfo) => void;
}> = ({ user, onCancel, onSave }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        form.setFieldsValue({
            ...user,
            birthday: user.birthday ? dayjs(user.birthday, 'DD/MM/YYYY') : null
        });
    }, [user, form]);

    const handleSave = () => {
        form.validateFields()
            .then(values => {
                onSave({
                    ...user,
                    ...values,
                    birthday: values.birthday ? values.birthday.format('DD/MM/YYYY') : undefined
                });
            })
            .catch(() => { });
    };

    return (
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
                        style={{
                            border: '3px solid #1677ff',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                    />
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
                            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input size="large" placeholder="Nhập họ và tên" />
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

const StaffChangePasswordForm: React.FC<{
    onCancel: () => void;
    onSuccess: () => void;
}> = ({ onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const { oldPassword, newPassword } = await form.validateFields();
            setLoading(true);
            await changeStaffPassword(oldPassword, newPassword);
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
                            { min: 1, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password size="large" placeholder="Nhập mật khẩu cũ" />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 1, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
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
                            loading={loading}
                        >
                            Đổi Mật Khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </Card>
    );
};

const StaffProfile: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string>('thongtincanhan');
    const [user, setUser] = useState<UserInfo | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const isDesktop = useMediaQuery ? useMediaQuery("(min-width: 1024px)") : true;

    useEffect(() => {
        if (typeof isDesktop === "boolean") setSidebarOpen(isDesktop);
    }, [isDesktop]);

    // Thêm useEffect để reload lại profile khi quay lại trang này (fix trường hợp chuyển từ profile lên không hiển thị)
    useEffect(() => {
        setLoading(true);
        fetchStaffProfile()
            .then((data) => {
                setUser(data);
                setLoading(false);
            })
            .catch((err) => {
                setLoading(false);
                message.error('Không lấy được thông tin nhân viên!');
            });
        // Reset edit/changePassword mode khi chuyển tab
        setEditMode(false);
        setChangePasswordMode(false);
    }, [window.location.pathname]);

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
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/login';
                },
            });
        } else {
            setActiveMenu(e.key);
        }
    };

    const handleSaveProfile = async (values: UserInfo) => {
        setLoading(true);
        try {
            const updated = await updateStaffProfile(values);
            setUser(updated);
            setEditMode(false);
            message.success('Cập nhật thông tin thành công!');
        } catch (err: any) {
            message.error(err.message || 'Cập nhật thông tin thất bại!');
        }
        setLoading(false);
    };

    const renderContent = () => {
        if (loading || !user) {
            return (
                <div className="user-profile-loading">
                    <Spin size="large" />
                </div>
            );
        }
        return (
            <div className="user-profile-main-content">
                {!editMode && !changePasswordMode ? (
                    <StaffPersonalInfo
                        user={user}
                        onEdit={() => setEditMode(true)}
                        onChangePassword={() => setChangePasswordMode(true)}
                    />
                ) : editMode ? (
                    <StaffEditProfileForm
                        user={user}
                        onCancel={() => setEditMode(false)}
                        onSave={handleSaveProfile}
                    />
                ) : (
                    <StaffChangePasswordForm
                        onCancel={() => setChangePasswordMode(false)}
                        onSuccess={() => setChangePasswordMode(false)}
                    />
                )}
            </div>
        );
    };

    return (
        <>
            {/* Xóa nút quay về trang chủ ở staff, chỉ giữ sidebar */}
            {/* <div style={{ maxWidth: 1200, margin: '24px auto 0', padding: '0 24px' }}>
                <Button
                    type="link"
                    icon={<CaretLeftOutlined />}
                    style={{ fontSize: 16, paddingLeft: 0 }}
                    onClick={() => window.location.href = '/staff/dashboard/overview'}
                >
                    Quay về trang chủ
                </Button>
            </div> */}
            <div className="flex min-h-screen bg-background">
                <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />
                <div className="flex flex-col flex-1 w-full">
                    <main className="flex-1 h-full" style={{ padding: 24 }}>
                        <Layout className="user-profile-layout">
                            <Layout className="user-profile-inner-layout">
                                <Content className="user-profile-content">
                                    {renderContent()}
                                </Content>
                            </Layout>
                        </Layout>
                    </main>
                </div>
            </div>
        </>
    );
};

export default StaffProfile;
