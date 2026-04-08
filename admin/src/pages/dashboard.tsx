import { Card, Row, Col, Typography, Space, Tag, Divider, Spin, Empty, Statistic } from "antd";
import { 
  CalendarOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  DollarOutlined
} from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { API_URL } from "../constants/app";
import { getAuthHeaders } from "../utils/auth";

const { Text } = Typography;

interface DashboardStats {
  totalUsers?: number;
  totalOrders?: number;
  totalRevenue?: number;
  totalProducts?: number;
  totalBrands?: number;
  totalModels?: number;
  totalBanners?: number;
  totalStores?: number;
  totalFaqs?: number;
  totalViews?: number;
}

interface Activity {
  id: string | number;
  action: string;
  user: string;
  createdAt: string;
  type?: "create" | "update" | "delete" | "system";
}

interface ApiResponse<T> {
  code: number;
  data: T;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [miniUsers, setMiniUsers] = useState<Record<string, number>>({});

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const response = await fetch(`${API_URL}/admin/stats/dashboard`, {
          headers: getAuthHeaders(false),
        });
        const result: ApiResponse<DashboardStats> = await response.json();
        if (import.meta.env.DEV) {
          console.log('统计数据响应:', result);
        }
        if (result.code === 200 && result.data) {
          setStats(result.data);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('获取统计数据失败:', error);
        }
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // 获取小程序用户专项统计
  useEffect(() => {
    const fetchMiniUsers = async () => {
      try {
        setActivitiesLoading(true);
        const response = await fetch(`${API_URL}/admin/stats/mini-users`, {
          headers: getAuthHeaders(false),
        });
        const result: ApiResponse<Record<string, number>> = await response.json();
        if (import.meta.env.DEV) {
          console.log('小程序用户统计响应:', result);
        }
        if (result.code === 200 && result.data) {
          setMiniUsers(result.data || {});
          setRecentActivities([]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('获取小程序用户统计失败:', error);
        }
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchMiniUsers();
  }, []);


  return (
    <div style={{ padding: "24px" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* 基础数据统计 */}
        <Card title="基础数据">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Spin spinning={statsLoading}>
                  <Statistic
                    title="总用户数"
                    value={stats.totalUsers || 0}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Spin>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Spin spinning={statsLoading}>
                  <Statistic
                    title="总订单数"
                    value={stats.totalOrders || 0}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Spin>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Spin spinning={statsLoading}>
                  <Statistic
                    title="总收入"
                    value={stats.totalRevenue || 0}
                    prefix={<DollarOutlined />}
                    precision={2}
                    valueStyle={{ color: "#fa8c16" }}
                  />
                </Spin>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Spin spinning={statsLoading}>
                  <Statistic
                    title="商品数量"
                    value={stats.totalProducts || stats.totalModels || 0}
                    prefix={<BarChartOutlined />}
                    valueStyle={{ color: "#722ed1" }}
                  />
                </Spin>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* 小程序用户统计 */}
        <Card title="小程序用户统计" extra={<CalendarOutlined />}>
          <Spin spinning={activitiesLoading}>
            {Object.keys(miniUsers).length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {Object.entries(miniUsers).map(([key, value], index) => (
                    <div key={key}>
                      <Row align="middle" justify="space-between">
                        <Col>
                          <Space>
                            <span style={{ fontSize: "16px" }}>👤</span>
                            <div>
                              <Text>{key}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                小程序用户专项统计
                              </Text>
                            </div>
                          </Space>
                        </Col>
                        <Col>
                          <Tag color="blue">{value}</Tag>
                        </Col>
                      </Row>
                      {index < Object.entries(miniUsers).length - 1 && <Divider style={{ margin: "8px 0" }} />}
                    </div>
                ))}
              </Space>
            ) : (
              <Empty description="暂无小程序用户统计" />
            )}
          </Spin>
        </Card>
      </Space>
    </div>
  );
};

export default Dashboard;
