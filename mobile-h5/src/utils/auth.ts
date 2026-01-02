// token存储的key
const TOKEN_KEY = 'law_firm_token';
const TOKEN_EXPIRE_KEY = 'law_firm_token_expire';

// 设置token
export function setToken(token: string, remember: boolean = false): void {
  if (remember) {
    // 记住密码，存储到localStorage
    localStorage.setItem(TOKEN_KEY, token);
    // 设置过期时间，默认7天
    const expireTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem(TOKEN_EXPIRE_KEY, expireTime.toString());
  } else {
    // 不记住密码，存储到sessionStorage
    sessionStorage.setItem(TOKEN_KEY, token);
    // 不设置过期时间
    sessionStorage.removeItem(TOKEN_EXPIRE_KEY);
  }
}

// 获取token
export function getToken(): string | null {
  // 先从sessionStorage获取
  let token = sessionStorage.getItem(TOKEN_KEY);
  let expireTime = sessionStorage.getItem(TOKEN_EXPIRE_KEY);
  
  // 如果sessionStorage没有，从localStorage获取
  if (!token) {
    token = localStorage.getItem(TOKEN_KEY);
    expireTime = localStorage.getItem(TOKEN_EXPIRE_KEY);
  }
  
  // 检查token是否过期
  if (token && expireTime) {
    const now = Date.now();
    if (now > parseInt(expireTime)) {
      // token过期，清除
      removeToken();
      return null;
    }
  }
  
  return token;
}

// 移除token
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRE_KEY);
}
