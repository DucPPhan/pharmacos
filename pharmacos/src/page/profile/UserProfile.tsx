import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Avatar, Button, Spin, Modal, Form, Input, DatePicker, Select, Upload, message } from 'antd';
import {
    UserOutlined,
    ShoppingCartOutlined,
    HomeOutlined,
    FileTextOutlined,
    LogoutOutlined,
    EditOutlined,
    CameraOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

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

const PersonalInfo: React.FC<{
    user: UserInfo,
    onEdit: () => void
}> = ({ user, onEdit }) => (
    <Card
        title={null}
        style={{
            maxWidth: 420,
            margin: '0 auto',
            borderRadius: 16,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)',
            padding: 0,
            border: 'none'
        }}
        bodyStyle={{ padding: 0 }}
    >
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'linear-gradient(90deg, #1677ff 0%, #69b1ff 100%)',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 32,
            position: 'relative'
        }}>
            <div style={{ position: 'relative' }}>
                <Avatar
                    size={112}
                    src={user.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                    icon={<UserOutlined />}
                    style={{
                        marginBottom: 16,
                        border: '4px solid #fff',
                        background: '#fff',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                    }}
                />
                <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        right: 0,
                        backgroundColor: '#fff',
                        color: '#1677ff',
                        border: '2px solid #fff'
                    }}
                    onClick={onEdit}
                />
            </div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 22, marginBottom: 4 }}>{user.name}</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 15 }}>{user.phone}</div>
        </div>
        <div style={{ padding: 32, paddingTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#888' }}>Họ và tên</span>
                <span style={{ fontWeight: 500 }}>{user.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#888' }}>Số điện thoại</span>
                <span style={{ fontWeight: 500 }}>{user.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#888' }}>Email</span>
                <span style={{ fontWeight: 500 }}>{user.email || 'Chưa cập nhật'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#888' }}>Giới tính</span>
                <span style={{ fontWeight: 500 }}>{user.gender}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <span style={{ color: '#888' }}>Ngày sinh</span>
                <span style={{ fontWeight: 500 }}>{user.birthday || 'Chưa cập nhật'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ color: '#888' }}>Địa chỉ</span>
                <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: 200 }}>{user.address || 'Chưa cập nhật'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                <Button
                    type="primary"
                    shape="round"
                    size="large"
                    icon={<EditOutlined />}
                    onClick={onEdit}
                    style={{ padding: '0 24px', height: 40 }}
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
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);

    useEffect(() => {
        if (visible) {
            form.setFieldsValue({
                ...user,
                birthday: user.birthday ? dayjs(user.birthday, 'DD/MM/YYYY') : null
            });
            setAvatarUrl(user.avatarUrl);
        }
    }, [visible, user, form]);

    const handleSave = () => {
        form.validateFields()
            .then(values => {
                onSave({
                    ...user,
                    ...values,
                    birthday: values.birthday ? values.birthday.format('DD/MM/YYYY') : undefined,
                    avatarUrl
                });
            })
            .catch(() => { });
    };

    const beforeUpload = (file: File) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
        }
        return isJpgOrPng && isLt2M;
    };

    const handleUploadChange = (info: any) => {
        if (info.file.status === 'done') {
            const url = URL.createObjectURL(info.file.originFileObj);
            setAvatarUrl(url);
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
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
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <Upload
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    onChange={handleUploadChange}
                    customRequest={({ file, onSuccess }) => {
                        setTimeout(() => {
                            onSuccess?.('ok');
                        }, 0);
                    }}
                >
                    <Avatar
                        size={100}
                        src={avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                        icon={<UserOutlined />}
                        style={{
                            border: '3px solid #1677ff',
                            background: '#fff',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                        }}
                    />
                    <div style={{ marginTop: 8 }}>
                        <Button
                            type="link"
                            icon={<CameraOutlined />}
                            onClick={e => {
                                e.preventDefault();
                                (document.querySelector('.avatar-uploader input') as HTMLInputElement | null)?.click();
                            }}
                        >
                            Thay đổi ảnh
                        </Button>
                    </div>
                </Upload>
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        ...user,
                        birthday: user.birthday ? dayjs(user.birthday, 'DD/MM/YYYY') : null
                    }}
                    style={{ width: '100%', maxWidth: 320 }}
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
                            style={{ resize: 'none' }}
                        />
                    </Form.Item>
                </Form>
            </div>
        </Modal>
    );
};

const UserProfile: React.FC = () => {
    const [activeMenu, setActiveMenu] = useState<string>('thongtincanhan');
    const [user, setUser] = useState<UserInfo | null>(null);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setUser({
                name: 'Nguyễn Thành Đạt',
                phone: '0981657907',
                gender: 'Nam',
                email: 'dat.nguyen@gmail.com',
                birthday: '15/05/1990',
                address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
                avatarUrl: ''
            });
            setLoading(false);
        }, 500);
    }, []);

    const handleMenuClick = (e: any) => {
        if (e.key === 'logout') {
            Modal.confirm({
                title: 'Bạn có chắc chắn muốn đăng xuất?',
                content: 'Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ.',
                okText: 'Đăng xuất',
                cancelText: 'Hủy',
                onOk: () => {
                    console.log('Logging out...');
                    // TODO: Handle logout
                },
            });
        } else {
            setActiveMenu(e.key);
        }
    };

    const handleSaveProfile = (values: UserInfo) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setUser(values);
            setLoading(false);
            setEditModalVisible(false);
            message.success('Cập nhật thông tin thành công!');
        }, 500);
    };

    const renderContent = () => {
        if (loading || !user) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 400,
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px #f0f1f2'
                }}>
                    <Spin size="large" />
                </div>
            );
        }

        switch (activeMenu) {
            case 'thongtincanhan':
                return (
                    <div style={{
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 2px 8px #f0f1f2',
                        minHeight: 400,
                        padding: 24
                    }}>
                        <PersonalInfo
                            user={user}
                            onEdit={() => setEditModalVisible(true)}
                        />
                    </div>
                );
            case 'donhang':
                return (
                    <Card
                        title="Đơn hàng của tôi"
                        style={{
                            width: '100%',
                            borderRadius: 16,
                            boxShadow: '0 2px 8px #f0f1f2',
                            border: 'none'
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div style={{
                            background: '#f6f9ff',
                            borderRadius: 8,
                            padding: 40,
                            textAlign: 'center',
                            margin: 24
                        }}>
                            <ShoppingCartOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                            <div style={{ color: '#1677ff', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Không có đơn hàng nào</div>
                            <div style={{ color: '#666', marginBottom: 24 }}>Bạn chưa có đơn hàng nào. Hãy mua sắm ngay!</div>
                            <Button type="primary" shape="round" size="large">Mua sắm ngay</Button>
                        </div>
                    </Card>
                );
            case 'sodiachi':
                return (
                    <Card
                        title="Sổ địa chỉ"
                        style={{
                            width: '100%',
                            borderRadius: 16,
                            boxShadow: '0 2px 8px #f0f1f2',
                            border: 'none'
                        }}
                        extra={
                            <Button
                                type="primary"
                                shape="round"
                                size="large"
                                icon={<HomeOutlined />}
                            >
                                Thêm địa chỉ mới
                            </Button>
                        }
                        bodyStyle={{ padding: 0 }}
                    >
                        <div style={{
                            background: '#f6f9ff',
                            borderRadius: 8,
                            padding: 40,
                            textAlign: 'center',
                            margin: 24
                        }}>
                            <HomeOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                            <div style={{ color: '#1677ff', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Chưa có địa chỉ nào</div>
                            <div style={{ color: '#666', marginBottom: 24 }}>Vui lòng thêm địa chỉ để thuận tiện cho việc đặt hàng</div>
                            <Button type="primary" shape="round" size="large">Thêm địa chỉ mới</Button>
                        </div>
                    </Card>
                );
            case 'donthuoc':
                return (
                    <Card
                        title="Đơn thuốc của tôi"
                        style={{
                            width: '100%',
                            borderRadius: 16,
                            boxShadow: '0 2px 8px #f0f1f2',
                            border: 'none'
                        }}
                        bodyStyle={{ padding: 0 }}
                    >
                        <div style={{
                            background: '#f6f9ff',
                            borderRadius: 8,
                            padding: 40,
                            textAlign: 'center',
                            margin: 24
                        }}>
                            <FileTextOutlined style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                            <div style={{ color: '#1677ff', fontWeight: 600, fontSize: 18, marginBottom: 8 }}>Bạn chưa có đơn thuốc nào</div>
                            <div style={{ color: '#666' }}>Các đơn thuốc của bạn sẽ hiển thị ở đây</div>
                        </div>
                    </Card>
                );
            default:
                return null;
        }
    };

    return (
        <Layout style={{
            minHeight: 'calc(100vh - 64px)',
            background: '#f5f6fa',
            justifyContent: 'center',
            padding: '32px 0'
        }}>
            <Layout style={{
                width: '100%',
                maxWidth: 1200,
                margin: '0 auto',
                background: 'transparent',
                borderRadius: 16
            }}>
                <Sider
                    width={280}
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        marginRight: 24,
                        boxShadow: '0 2px 8px #f0f1f2',
                        padding: '32px 0'
                    }}
                    breakpoint="lg"
                    collapsedWidth="0"
                >
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <Avatar
                            size={80}
                            src={user?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                            icon={<UserOutlined />}
                            style={{
                                marginBottom: 16,
                                border: '3px solid #1677ff',
                                background: '#fff',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                            }}
                        />
                        <div style={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}>{user?.name}</div>
                        <div style={{ fontSize: 14, color: '#666' }}>{user?.phone}</div>
                    </div>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeMenu]}
                        onClick={handleMenuClick}
                        style={{
                            border: 'none',
                            fontSize: 15,
                            padding: '0 16px'
                        }}
                        items={[
                            {
                                key: 'thongtincanhan',
                                icon: <UserOutlined style={{ fontSize: 18 }} />,
                                label: 'Thông tin cá nhân',
                            },
                            {
                                key: 'donhang',
                                icon: <ShoppingCartOutlined style={{ fontSize: 18 }} />,
                                label: 'Đơn hàng của tôi',
                            },
                            {
                                key: 'sodiachi',
                                icon: <HomeOutlined style={{ fontSize: 18 }} />,
                                label: 'Sổ địa chỉ',
                            },
                            {
                                key: 'donthuoc',
                                icon: <FileTextOutlined style={{ fontSize: 18 }} />,
                                label: 'Đơn thuốc của tôi',
                            },
                            {
                                key: 'logout',
                                icon: <LogoutOutlined style={{ fontSize: 18 }} />,
                                label: <span style={{ color: '#ff4d4f' }}>Đăng xuất</span>,
                                danger: true,
                                style: { marginTop: 8 }
                            },
                        ]}
                    />
                </Sider>
                <Content style={{
                    flex: 1,
                    minHeight: 600,
                    borderRadius: 16
                }}>
                    {renderContent()}
                </Content>
            </Layout>

            {user && (
                <EditProfileModal
                    visible={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    onSave={handleSaveProfile}
                    user={user}
                />
            )}
        </Layout>
    );
};

export default UserProfile;