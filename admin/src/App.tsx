import { Refine, I18nProvider } from '@refinedev/core'
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar'

import { ErrorComponent, useNotificationProvider, ThemedLayout, ThemedSider } from '@refinedev/antd'
import '@refinedev/antd/dist/reset.css'

import { customDataProvider } from './providers/customDataProvider'
import { App as AntdApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { BrowserRouter, Route, Routes, Outlet, Navigate } from 'react-router'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'
import {
    DashboardOutlined,
    PictureOutlined,
    AppstoreOutlined,
    TagsOutlined,
    ShopOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    SettingOutlined,
} from '@ant-design/icons'
import { APP_NAME } from './constants/app'

// 配置 dayjs
dayjs.extend(relativeTime)
dayjs.extend(updateLocale)
dayjs.locale('zh-cn')
import routerProvider, {
    NavigateToResource,
    UnsavedChangesNotifier,
    DocumentTitleHandler,
} from '@refinedev/react-router'
import { useIsAuthenticated } from '@refinedev/core'
import { zhCN as refineZhCN } from './i18n'
import {
    BannerList,
    BannerCreate,
    BannerEdit,
    BannerShow,
    BannerTest,
    CorsTest,
} from './pages/banners'
import {
    ProductTypeList,
    ProductTypeCreate,
    ProductTypeEdit,
    ProductTypeShow,
} from './pages/product-types'
import { BrandList, BrandCreate, BrandEdit, BrandShow } from './pages/brands'
import {
    BrandDetailList,
    BrandDetailCreate,
    BrandDetailEdit,
    BrandDetailShow,
} from './pages/brand-details'
import {
    StoreAddressList,
    StoreAddressCreate,
    StoreAddressEdit,
    StoreAddressShow,
} from './pages/store-addresses'
import { UserList, UserCreate, UserEdit, UserShow } from './pages/users'
import { OrderList, OrderCreate, OrderEdit, OrderShow } from './pages/orders'
import {
    ConfigList,
    ConfigCreate,
    ConfigEdit,
    ConfigShow,
} from './pages/configs'
import { Login } from './pages/login'
import { Dashboard } from './pages/dashboard'
import { ChangePassword } from './pages/admin/change-password'
import { ResetPassword } from './pages/admin/reset-password'
import { AppIcon } from './components/app-icon'
import { ColorModeContextProvider } from './contexts/color-mode'
import { Header } from './components/header'
import { authProvider } from './providers/authProvider'
import React from 'react'
import { getToken, isTokenExpiringSoon, refreshToken } from './utils/auth'

// 配置 Refine 的 i18nProvider
const i18nProvider: I18nProvider = {
    translate: (key: string, options?: Record<string, string | number>) => {
        const keys = key.split('.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let value: any = refineZhCN

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                return key
            }
        }

        if (typeof value === 'string' && options) {
            return value.replace(/\{\{(\w+)\}\}/g, (_, key) => options[key]?.toString() || '')
        }

        return value || key
    },
    changeLocale: async () => {
        return Promise.resolve()
    },
    getLocale: () => 'zh-CN',
}

// Token 自动刷新组件
const TokenRefreshHandler: React.FC = () => {
    React.useEffect(() => {
        // 每 1 分钟检查一次 token 是否即将过期
        const checkInterval = setInterval(() => {
            const token = getToken();
            if (token && isTokenExpiringSoon(token, 5)) {
                // Token 将在 5 分钟内过期，自动刷新
                if (import.meta.env.DEV) {
                    console.log('Token 即将过期，自动刷新...');
                }
                refreshToken().then((success) => {
                    if (!success && import.meta.env.DEV) {
                        console.warn('Token 刷新失败，可能需要重新登录');
                    }
                });
            }
        }, 60 * 1000); // 每 60 秒检查一次

        // 立即检查一次
        const token = getToken();
        if (token && isTokenExpiringSoon(token, 5)) {
            refreshToken();
        }

        return () => {
            clearInterval(checkInterval);
        };
    }, []);

    return null;
};

// 根路径重定向组件 - 根据认证状态决定重定向到登录页还是仪表盘
const RootRedirect: React.FC = () => {
    // 首先检查 localStorage 中是否有 token（同步检查，避免延迟）
    const token = localStorage.getItem("auth_token");
    
    // 如果没有 token，直接跳转到登录页
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    // 如果有 token，使用 useIsAuthenticated 进行验证
    const { isFetching, isError, data } = useIsAuthenticated();
    
    // 如果正在检查认证状态，显示加载状态
    if (isFetching) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>加载中...</div>
            </div>
        );
    }
    
    // 如果未认证（有错误或没有认证数据），重定向到登录页
    if (isError || !data) {
        return <Navigate to="/login" replace />;
    }
    
    // 如果已认证，重定向到仪表盘
    return <Navigate to="/dashboard" replace />;
};

// 路由保护组件 - 检查用户是否已登录
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // 首先检查 localStorage 中是否有 token（同步检查，避免延迟）
    const token = localStorage.getItem("auth_token");
    
    // 如果没有 token，直接跳转到登录页
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    // 如果有 token，使用 useIsAuthenticated 进行验证
    const { isFetching, isError, data } = useIsAuthenticated();
    
    // 如果正在检查认证状态，显示加载状态
    if (isFetching) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>加载中...</div>
            </div>
        );
    }
    
    // 如果未认证（有错误或没有认证数据），重定向到登录页
    if (isError || !data) {
        return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
};

function App() {
    return (
        <BrowserRouter>
            <RefineKbarProvider>
                <ConfigProvider locale={zhCN}>
                    <ColorModeContextProvider>
                        <AntdApp>
                            <Refine
                                dataProvider={customDataProvider}
                                notificationProvider={useNotificationProvider}
                                routerProvider={routerProvider}
                                authProvider={authProvider}
                                i18nProvider={i18nProvider}
                                resources={[
                                    {
                                        name: 'dashboard',
                                        list: '/dashboard',
                                        meta: {
                                            label: '仪表盘',
                                            icon: <DashboardOutlined />,
                                        },
                                    },
                                    {
                                        name: 'banners',
                                        list: '/banners',
                                        create: '/banners/create',
                                        edit: '/banners/edit/:id',
                                        show: '/banners/show/:id',
                                        meta: {
                                            canDelete: true,
                                            label: '轮播图管理',
                                            icon: <PictureOutlined />,
                                        },
                                    },
                                    {
                                        name: 'product-types',
                                        list: '/product-types',
                                        create: '/product-types/create',
                                        edit: '/product-types/edit/:id',
                                        show: '/product-types/show/:id',
                                        meta: {
                                            canDelete: true,
                                            label: '产品类型',
                                            icon: <AppstoreOutlined />,
                                        },
                                    },
                                    {
                                        name: 'brands',
                                        list: '/brands',
                                        create: '/brands/create',
                                        edit: '/brands/edit/:id',
                                        show: '/brands/show/:id',
                                        meta: {
                                            canDelete: true,
                                            label: '品牌管理',
                                            icon: <TagsOutlined />,
                                        },
                                    },
                                    {
                                        name: 'brand-details',
                                        list: '/brand-details',
                                        create: '/brand-details/create',
                                        edit: '/brand-details/edit/:id',
                                        show: '/brand-details/show/:id',
                                        meta: {
                                            canDelete: true,
                                            hide: true, // 不在菜单中显示
                                            parent: 'brands', // 设置父级为品牌管理
                                        },
                                    },
                                    {
                                        name: 'store-addresses',
                                        list: '/store-addresses',
                                        create: '/store-addresses/create',
                                        edit: '/store-addresses/edit/:id',
                                        show: '/store-addresses/show/:id',
                                        meta: {
                                            canDelete: true,
                                            label: '门店地址',
                                            icon: <ShopOutlined />,
                                        },
                                    },
                                    {
                                        name: 'users',
                                        list: '/users',
                                        create: '/users/create',
                                        edit: '/users/edit/:id',
                                        show: '/users/show/:id',
                                        meta: {
                                            canDelete: true,
                                            label: '用户管理',
                                            icon: <UserOutlined />,
                                        },
                                    },
                                    {
                                        name: 'orders',
                                        list: '/orders',
                                        create: '/orders/create',
                                        edit: '/orders/edit/:id',
                                        show: '/orders/show/:id',
                                        meta: {
                                            canDelete: true,
                                            label: '订单管理',
                                            icon: <ShoppingCartOutlined />,
                                        },
                                    },
                                    {
                                        name: 'configs',
                                        list: '/configs',
                                        create: '/configs/create',
                                        edit: '/configs/edit/:id',
                                        show: '/configs/show/:id',
                                        meta: {
                                            canDelete: true,
                                            label: '系统配置',
                                            icon: <SettingOutlined />,
                                        },
                                    },
                                ]}
                                options={{
                                    syncWithLocation: true,
                                    warnWhenUnsavedChanges: true,
                                    projectId: '50mu7C-sCbvxf-iw6KEw',
                                    title: { text: APP_NAME, icon: <AppIcon /> },
                                }}
                            >
                                <Routes>
                                    {/* 登录页面 */}
                                    <Route path="/login" element={<Login />} />

                                    {/* 根路径 - 根据认证状态重定向 */}
                                    <Route
                                        path="/"
                                        element={<RootRedirect />}
                                    />

                                    {/* 需要认证的页面 - 使用 ProtectedRoute 组件保护 */}
                                    <Route
                                        element={
                                            <ProtectedRoute>
                                                <ThemedLayout
                                                    Header={() => <Header sticky />}
                                                    Sider={(props) => <ThemedSider {...props} fixed />}
                                                >
                                                    <Outlet />
                                                </ThemedLayout>
                                            </ProtectedRoute>
                                        }
                                    >

                                        {/* 仪表盘 */}
                                        <Route path="/dashboard" element={<Dashboard />} />

                                        {/* 轮播图管理 */}
                                        <Route path="/banners">
                                            <Route index element={<BannerList />} />
                                            <Route path="create" element={<BannerCreate />} />
                                            <Route path="edit/:id" element={<BannerEdit />} />
                                            <Route path="show/:id" element={<BannerShow />} />
                                            <Route path="test" element={<BannerTest />} />
                                            <Route path="test-cors" element={<CorsTest />} />
                                        </Route>

                                        {/* 产品类型管理 */}
                                        <Route path="/product-types">
                                            <Route index element={<ProductTypeList />} />
                                            <Route path="create" element={<ProductTypeCreate />} />
                                            <Route path="edit/:id" element={<ProductTypeEdit />} />
                                            <Route path="show/:id" element={<ProductTypeShow />} />
                                        </Route>

                                        {/* 品牌管理 */}
                                        <Route path="/brands">
                                            <Route index element={<BrandList />} />
                                            <Route path="create" element={<BrandCreate />} />
                                            <Route path="edit/:id" element={<BrandEdit />} />
                                            <Route path="show/:id" element={<BrandShow />} />
                                        </Route>


                                        {/* 品牌详情管理 */}
                                        <Route path="/brand-details">
                                            <Route index element={<BrandDetailList />} />
                                            <Route path="create" element={<BrandDetailCreate />} />
                                            <Route path="edit/:id" element={<BrandDetailEdit />} />
                                            <Route path="show/:id" element={<BrandDetailShow />} />
                                        </Route>

                                        {/* 门店地址管理 */}
                                        <Route path="/store-addresses">
                                            <Route index element={<StoreAddressList />} />
                                            <Route path="create" element={<StoreAddressCreate />} />
                                            <Route path="edit/:id" element={<StoreAddressEdit />} />
                                            <Route path="show/:id" element={<StoreAddressShow />} />
                                        </Route>

                                        {/* 用户管理 */}
                                        <Route path="/users">
                                            <Route index element={<UserList />} />
                                            <Route path="create" element={<UserCreate />} />
                                            <Route path="edit/:id" element={<UserEdit />} />
                                            <Route path="show/:id" element={<UserShow />} />
                                        </Route>

                                        {/* 订单管理 */}
                                        <Route path="/orders">
                                            <Route index element={<OrderList />} />
                                            <Route path="create" element={<OrderCreate />} />
                                            <Route path="edit/:id" element={<OrderEdit />} />
                                            <Route path="show/:id" element={<OrderShow />} />
                                        </Route>

                                        {/* 系统配置管理 */}
                                        <Route path="/configs">
                                            <Route index element={<ConfigList />} />
                                            <Route path="create" element={<ConfigCreate />} />
                                            <Route path="edit/:id" element={<ConfigEdit />} />
                                            <Route path="show/:id" element={<ConfigShow />} />
                                        </Route>

                                        {/* 管理员功能 */}
                                        <Route path="/admin">
                                            <Route
                                                path="change-password"
                                                element={<ChangePassword />}
                                            />
                                            <Route
                                                path="reset-password/:id"
                                                element={<ResetPassword />}
                                            />
                                        </Route>

                                        <Route path="*" element={<ErrorComponent />} />
                                    </Route>
                                </Routes>

                                <RefineKbar />
                                <UnsavedChangesNotifier />
                                <DocumentTitleHandler />
                                <TokenRefreshHandler />
                            </Refine>
                            {/* <DevtoolsPanel /> */}
                        </AntdApp>
                    </ColorModeContextProvider>
                </ConfigProvider>
            </RefineKbarProvider>
        </BrowserRouter>
    )
}

export default App
