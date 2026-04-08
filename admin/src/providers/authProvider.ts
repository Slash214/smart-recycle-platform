import { AuthProvider } from "@refinedev/core";
import { isTokenExpired } from "../utils/auth";
import { API_URL } from "../constants/app";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    try {
      const response = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        // 从返回的数据结构中提取 token 和 admin 信息
        // 返回结构: { code: 200, data: { admin: {...}, token: "..." } }
        const responseData = data.data || data;
        const token = responseData.token;
        const admin = responseData.admin;
        
        if (token && admin) {
          // 存储 token 和用户信息
          localStorage.setItem("auth_token", token);
          localStorage.setItem("auth_user", JSON.stringify(admin));
        } else {
          return {
            success: false,
            error: {
              name: "LoginError",
              message: "登录响应数据格式错误",
            },
          };
        }
        
        return {
          success: true,
          redirectTo: "/dashboard",
        };
      } else {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: data.error?.message || "登录失败",
          },
        };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          name: "NetworkError",
          message: "网络连接失败，请检查服务器状态",
        },
      };
    }
  },

  logout: async () => {
    // 清除本地存储
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    
    return {
      success: true,
      redirectTo: "/login",
    };
  },

  check: async () => {
    const token = localStorage.getItem("auth_token");
    
    if (!token) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
    
    // 新接口下先基于 JWT 本地校验有效性，不再依赖旧 profile 接口
    if (isTokenExpired(token)) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }

    return {
      authenticated: true,
    };
  },

  getIdentity: async () => {
    const user = localStorage.getItem("auth_user");
    
    if (user) {
      return JSON.parse(user);
    }

    return null;
  },

  onError: async (error) => {
    if (import.meta.env.DEV) {
      console.error("认证错误:", error);
    }
    
    const status = error?.response?.status;
    
    // 仅在认证错误时自动登出并跳转登录
    if (status === 401 || status === 403) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      
      // 确保跳转到登录页
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      
      return {
        logout: true,
        redirectTo: "/login",
      };
    }
    
    return {};
  },

  getPermissions: async () => {
    const user = localStorage.getItem("auth_user");
    if (user) {
      const userData = JSON.parse(user);
      return {
        canEdit: userData.username !== "admin", // admin 账号不能编辑
      };
    }
    return {};
  },
};
