import React, { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { API_URL } from '../../constants/app';

const { Title, Paragraph, Text } = Typography;

interface TestResult {
  method: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  details?: string;
}

export const CorsTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const token = localStorage.getItem('auth_token');

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
  };

  const testMethod = async (method: string, url: string, body?: any) => {
    try {
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      };

      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        addResult({
          method,
          status: 'success',
          message: `✅ ${method} 请求成功`,
          details: `状态码: ${response.status}, 响应: ${JSON.stringify(data).substring(0, 100)}...`
        });
      } else {
        addResult({
          method,
          status: 'error',
          message: `❌ ${method} 请求失败`,
          details: `状态码: ${response.status}, 错误: ${data.error?.message || '未知错误'}`
        });
      }
    } catch (error) {
      addResult({
        method,
        status: 'error',
        message: `❌ ${method} 请求失败（CORS 错误）`,
        details: error instanceof Error ? error.message : '网络错误或 CORS 问题'
      });
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    // 测试 GET
    addResult({ method: 'GET', status: 'pending', message: '正在测试 GET...' });
    await testMethod('GET', `${API_URL}/banners?offset=0&limit=1`);

    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试 POST (创建测试数据)
    addResult({ method: 'POST', status: 'pending', message: '正在测试 POST...' });
    await testMethod('POST', `${API_URL}/banners`, {
      imgUrl: '/test-cors.jpg',
      text: 'CORS 测试',
      link: 'https://example.com',
      status: 0
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试 PATCH
    addResult({ method: 'PATCH', status: 'pending', message: '正在测试 PATCH...' });
    await testMethod('PATCH', `${API_URL}/banners/1`, {
      text: 'CORS 测试 - PATCH 更新'
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试 PUT
    addResult({ method: 'PUT', status: 'pending', message: '正在测试 PUT...' });
    await testMethod('PUT', `${API_URL}/banners/1`, {
      imgUrl: '/test-cors.jpg',
      text: 'CORS 测试 - PUT 更新',
      link: 'https://example.com',
      status: 1
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    // 测试 DELETE
    addResult({ method: 'DELETE', status: 'pending', message: '正在测试 DELETE...' });
    await testMethod('DELETE', `${API_URL}/banners/999`);

    setTesting(false);
  };

  const testPatchOnly = async () => {
    setTesting(true);
    setResults([]);
    
    addResult({ method: 'PATCH', status: 'pending', message: '正在测试 PATCH...' });
    await testMethod('PATCH', `${API_URL}/banners/2`, {
      status: 1
    });
    
    setTesting(false);
  };

  const testDeleteOnly = async () => {
    setTesting(true);
    setResults([]);
    
    addResult({ method: 'DELETE', status: 'pending', message: '正在测试 DELETE...' });
    await testMethod('DELETE', `${API_URL}/banners/999`);
    
    setTesting(false);
  };

  return (
    <Card>
      <Title level={2}>🔍 CORS 配置测试工具</Title>
      
      <Alert
        message="测试说明"
        description={
          <div>
            <Paragraph>
              此工具用于测试后端 API 的 CORS 配置是否正确。
            </Paragraph>
            <Paragraph>
              <strong>测试的 HTTP 方法：</strong>
              <br />
              • GET - 查询数据
              <br />
              • POST - 创建数据
              <br />
              • PATCH - 部分更新（最佳实践）⭐
              <br />
              • PUT - 完整替换
              <br />
              • DELETE - 删除数据
            </Paragraph>
            <Paragraph type="warning">
              <strong>注意：</strong>如果看到 CORS 错误，说明后端配置有问题，请查看 CORS_DEBUG.md 文档。
            </Paragraph>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space wrap>
          <Button 
            type="primary" 
            onClick={runAllTests}
            loading={testing}
            size="large"
          >
            运行完整测试
          </Button>
          
          <Button 
            onClick={testPatchOnly}
            loading={testing}
          >
            只测试 PATCH
          </Button>
          
          <Button 
            onClick={testDeleteOnly}
            loading={testing}
          >
            只测试 DELETE
          </Button>
          
          <Button 
            onClick={() => setResults([])}
            disabled={testing}
          >
            清除结果
          </Button>
        </Space>

        <Divider />

        <div>
          <Title level={4}>测试结果</Title>
          
          {results.length === 0 && (
            <Paragraph type="secondary">
              点击上方按钮开始测试...
            </Paragraph>
          )}

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {results.map((result, index) => (
              <Card
                key={index}
                size="small"
                style={{
                  borderColor: result.status === 'success' ? '#52c41a' : 
                               result.status === 'error' ? '#ff4d4f' : '#d9d9d9'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    {result.status === 'success' && (
                      <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                    )}
                    {result.status === 'error' && (
                      <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                    )}
                    <Text strong>{result.method}</Text>
                    <Text>{result.message}</Text>
                  </Space>
                  
                  {result.details && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {result.details}
                    </Text>
                  )}
                </Space>
              </Card>
            ))}
          </Space>
        </div>

        <Divider />

        <Card size="small" style={{ backgroundColor: '#f0f2f5' }}>
          <Title level={5}>💡 如何解读结果</Title>
          <Paragraph>
            <Text strong style={{ color: '#52c41a' }}>✅ 成功：</Text> 该方法的 CORS 配置正确
            <br />
            <Text strong style={{ color: '#ff4d4f' }}>❌ 失败（CORS错误）：</Text> 
            后端的 Access-Control-Allow-Methods 中缺少该方法
            <br />
            <Text strong style={{ color: '#ff4d4f' }}>❌ 失败（其他错误）：</Text> 
            请求已通过 CORS，但业务逻辑有问题（如资源不存在）
          </Paragraph>
          
          <Paragraph>
            <Text strong>后端需要的 CORS 配置：</Text>
          </Paragraph>
          <pre style={{ 
            backgroundColor: '#fff', 
            padding: 12, 
            borderRadius: 4,
            overflow: 'auto'
          }}>
{`// Node.js + Express 示例
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));`}
          </pre>
        </Card>
      </Space>
    </Card>
  );
};

