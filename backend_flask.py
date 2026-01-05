from flask import Flask, jsonify, request
from flask_cors import CORS
import pymysql
from datetime import datetime

app = Flask(__name__)
CORS(app)

# 数据库配置（不包含数据库名）
DB_CONFIG_BASE = {
    'host': '10.6.0.17',
    'port': 3306,
    'user': 'root',
    'password': 'ZY520117.',
    'charset': 'utf8mb4'
}

DB_NAME = 'law_firm_management'

# 创建数据库（如果不存在）
def create_database():
    try:
        # 先不指定数据库连接
        conn = pymysql.connect(**DB_CONFIG_BASE)
        conn.autocommit(True)
        cursor = conn.cursor()
        # 创建数据库
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.close()
        conn.close()
        print(f"数据库 {DB_NAME} 创建成功或已存在")
    except Exception as e:
        print(f"创建数据库失败: {e}")

# 初始化数据库表结构
def init_database_tables():
    try:
        # 连接到数据库
        conn = pymysql.connect(**DB_CONFIG)
        conn.autocommit(True)
        cursor = conn.cursor()
        
        # 创建用户表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(100) NOT NULL,
            role ENUM('admin', 'lawyer', 'client') NOT NULL,
            status TINYINT NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        
        # 创建案例表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS cases (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_number VARCHAR(50) NOT NULL UNIQUE,
            title VARCHAR(200) NOT NULL,
            description TEXT,
            status ENUM('pending', 'processing', 'completed', 'closed') NOT NULL DEFAULT 'pending',
            lawyer_id INT,
            client_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (lawyer_id) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        
        # 创建客户表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS clients (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNIQUE,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(100),
            address TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        
        # 创建财务表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS financial (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT,
            amount DECIMAL(10, 2) NOT NULL,
            type ENUM('income', 'expense') NOT NULL,
            description VARCHAR(200),
            status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        
        # 创建文档表
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS documents (
            id INT AUTO_INCREMENT PRIMARY KEY,
            case_id INT,
            title VARCHAR(200) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            uploaded_by INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE SET NULL,
            FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """)
        
        # 插入初始数据
        # 检查是否已有管理员用户
        cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'admin'")
        if cursor.fetchone()[0] == 0:
            # 插入管理员用户
            cursor.execute("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')")
            # 插入律师用户
            cursor.execute("INSERT INTO users (username, password, role) VALUES ('lawyer1', 'lawyer123', 'lawyer')")
            # 插入客户用户
            cursor.execute("INSERT INTO users (username, password, role) VALUES ('client1', 'client123', 'client')")
        
        cursor.close()
        conn.close()
        print("数据库表结构初始化成功")
    except Exception as e:
        print(f"初始化数据库表结构失败: {e}")

# 完整数据库配置（包含数据库名）
DB_CONFIG = {
    **DB_CONFIG_BASE,
    'database': DB_NAME
}

# 创建数据库连接
@app.before_request

def before_request():
    try:
        # 确保数据库存在
        create_database()
        # 初始化数据库表结构
        init_database_tables()
        # 连接到数据库
        conn = pymysql.connect(**DB_CONFIG)
        app.config['db'] = conn
    except Exception as e:
        print(f"数据库连接失败: {e}")
        app.config['db_error'] = str(e)

# 关闭数据库连接
@app.teardown_request
def teardown_request(exception):
    if 'db' in app.config and app.config['db']:
        app.config['db'].close()

# 健康检查接口
@app.route('/health', methods=['GET'])
def health_check():
    # 健康检查不依赖数据库
    return jsonify({
        'status': 'OK',
        'timestamp': datetime.now().isoformat(),
        'uptime': '0',
        'environment': 'production'
    })

# 认证路由 - 支持微信登录和账号密码登录
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    code = data.get('code')
    username = data.get('username')
    password = data.get('password')
    account = data.get('account')  # 支持account字段，与username同义
    
    try:
        conn = app.config['db']
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # 1. 微信登录处理
        if code:
            print(f"收到微信登录请求，code: {code}")
            # 这里应该调用微信API验证code，但由于没有微信配置，我们模拟返回客户用户
            # 在实际部署时，这里需要替换为真实的微信登录逻辑
            # 获取微信用户信息，然后查找或创建用户
            
            # 模拟微信登录成功，返回客户用户
            return jsonify({
                'code': 200,
                'message': '微信登录成功',
                'data': {
                    'token': 'test-wechat-token',
                    'user': {
                        'id': 6,
                        'username': 'client1',
                        'role': 'client',
                        'status': 1
                    }
                }
            })
        
        # 2. 账号密码登录处理
        elif (username or account) and password:
            login_username = username or account
            print(f"收到账号密码登录请求，用户名: {login_username}")
            
            # 查询用户
            cursor.execute("SELECT id, username, role, status FROM users WHERE username = %s AND password = %s", (login_username, password))
            user = cursor.fetchone()
            
            if user:
                return jsonify({
                    'code': 200,
                    'message': '登录成功',
                    'data': {
                        'token': 'test-token',
                        'user': user
                    }
                })
            else:
                return jsonify({
                    'code': 401,
                    'message': '用户名或密码错误'
                })
        
        # 3. 参数错误
        else:
            return jsonify({
                'code': 400,
                'message': '请求参数错误，请提供有效的登录信息'
            })
            
    except Exception as e:
        print(f"登录失败: {e}")
        return jsonify({
            'code': 500,
            'message': '服务器内部错误'
        })

# 支持登录的另一个路径，兼容前端api.user.loginWithAccount调用
@app.route('/api/user/login', methods=['POST'])
def user_login():
    return login()

# 支持登录的另一个路径，兼容前端api.user.loginWithAccount调用
@app.route('/api/user/loginWithAccount', methods=['POST'])
def user_login_with_account():
    return login()

# 用户路由
@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        conn = app.config['db']
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # 查询所有用户
        cursor.execute("SELECT id, username, role, status, created_at FROM users")
        users = cursor.fetchall()
        
        return jsonify({
            'code': 200,
            'message': '获取用户列表成功',
            'data': users
        })
    except Exception as e:
        print(f"获取用户列表失败: {e}")
        return jsonify({
            'code': 500,
            'message': '服务器内部错误'
        })

# 案例路由
@app.route('/api/cases', methods=['GET'])
def get_cases():
    try:
        conn = app.config['db']
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # 查询所有案例
        cursor.execute("SELECT id, case_number, title, description, status, lawyer_id, client_id, created_at FROM cases")
        cases = cursor.fetchall()
        
        return jsonify({
            'code': 200,
            'message': '获取案例列表成功',
            'data': cases
        })
    except Exception as e:
        print(f"获取案例列表失败: {e}")
        return jsonify({
            'code': 500,
            'message': '服务器内部错误'
        })

# 客户路由
@app.route('/api/clients', methods=['GET'])
def get_clients():
    try:
        conn = app.config['db']
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # 查询所有客户
        cursor.execute("""
        SELECT c.id, c.user_id, c.name, c.phone, c.email, c.address, u.username, u.status 
        FROM clients c 
        INNER JOIN users u ON c.user_id = u.id
        """)
        clients = cursor.fetchall()
        
        return jsonify({
            'code': 200,
            'message': '获取客户列表成功',
            'data': clients
        })
    except Exception as e:
        print(f"获取客户列表失败: {e}")
        return jsonify({
            'code': 500,
            'message': '服务器内部错误'
        })

# 财务路由
@app.route('/api/financial', methods=['GET'])
def get_financial():
    try:
        conn = app.config['db']
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # 查询所有财务记录
        cursor.execute("""
        SELECT f.id, f.case_id, f.amount, f.type, f.description, f.status, f.created_at, c.case_number, c.title 
        FROM financial f 
        LEFT JOIN cases c ON f.case_id = c.id
        """)
        financial_records = cursor.fetchall()
        
        return jsonify({
            'code': 200,
            'message': '获取财务数据成功',
            'data': financial_records
        })
    except Exception as e:
        print(f"获取财务数据失败: {e}")
        return jsonify({
            'code': 500,
            'message': '服务器内部错误'
        })

# 文档路由
@app.route('/api/documents', methods=['GET'])
def get_documents():
    try:
        conn = app.config['db']
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        
        # 查询所有文档
        cursor.execute("""
        SELECT d.id, d.case_id, d.title, d.file_path, d.uploaded_by, d.created_at, c.case_number, c.title as case_title, u.username as uploaded_by_username 
        FROM documents d 
        LEFT JOIN cases c ON d.case_id = c.id
        LEFT JOIN users u ON d.uploaded_by = u.id
        """)
        documents = cursor.fetchall()
        
        return jsonify({
            'code': 200,
            'message': '获取文档列表成功',
            'data': documents
        })
    except Exception as e:
        print(f"获取文档列表失败: {e}")
        return jsonify({
            'code': 500,
            'message': '服务器内部错误'
        })

# 404处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'code': 404,
        'message': '接口不存在'
    }), 404

# 500处理
@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'code': 500,
        'message': '服务器内部错误'
    }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=False)