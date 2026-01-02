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

# 认证路由
@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # 简单的登录逻辑（实际应该查询数据库验证）
    if username == 'admin' and password == 'admin123':
        return jsonify({
            'code': 200,
            'message': '登录成功',
            'data': {
                'token': 'test-token',
                'user': {
                    'id': 1,
                    'username': 'admin',
                    'role': 'admin'
                }
            }
        })
    else:
        return jsonify({
            'code': 401,
            'message': '用户名或密码错误'
        })

# 用户路由
@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify({
        'code': 200,
        'message': '获取用户列表成功',
        'data': [
            {
                'id': 1,
                'username': 'admin',
                'role': 'admin',
                'status': 1
            },
            {
                'id': 2,
                'username': 'lawyer1',
                'role': 'lawyer',
                'status': 1
            },
            {
                'id': 3,
                'username': 'client1',
                'role': 'client',
                'status': 1
            }
        ]
    })

# 案例路由
@app.route('/api/cases', methods=['GET'])
def get_cases():
    return jsonify({
        'code': 200,
        'message': '获取案例列表成功',
        'data': []
    })

# 客户路由
@app.route('/api/clients', methods=['GET'])
def get_clients():
    return jsonify({
        'code': 200,
        'message': '获取客户列表成功',
        'data': []
    })

# 财务路由
@app.route('/api/financial', methods=['GET'])
def get_financial():
    return jsonify({
        'code': 200,
        'message': '获取财务数据成功',
        'data': []
    })

# 文档路由
@app.route('/api/documents', methods=['GET'])
def get_documents():
    return jsonify({
        'code': 200,
        'message': '获取文档列表成功',
        'data': []
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
