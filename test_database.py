import pymysql
import json

# 数据库配置
DB_CONFIG = {
    'host': '10.6.0.17',
    'port': 3306,
    'user': 'root',
    'password': 'ZY520117.',
    'database': 'law_firm_management',
    'charset': 'utf8mb4'
}

print("测试数据库连接...")
try:
    # 测试数据库连接
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    print("✓ 数据库连接成功")
    
    # 检查用户表结构
    print("\n检查用户表结构...")
    cursor.execute("DESCRIBE users")
    table_structure = cursor.fetchall()
    print(f"✓ 用户表包含 {len(table_structure)} 个字段")
    
    # 检查用户数据
    print("\n检查用户数据...")
    cursor.execute("SELECT * FROM users")
    users = cursor.fetchall()
    print(f"✓ 用户表包含 {len(users)} 个用户")
    for user in users:
        print(f"  - 用户ID: {user['id']}, 用户名: {user['username']}, 密码: {user['password']}, 角色: {user['role']}, 状态: {user['status']}")
    
    # 测试登录逻辑
    print("\n测试登录逻辑...")
    test_cases = [
        {'username': 'admin', 'password': 'admin123', 'expected': True},
        {'username': 'lawyer1', 'password': 'lawyer123', 'expected': True},
        {'username': 'client1', 'password': 'client123', 'expected': True},
        {'username': 'admin', 'password': 'wrong', 'expected': False},
        {'username': 'nonexistent', 'password': 'test', 'expected': False}
    ]
    
    for test in test_cases:
        cursor.execute(
            "SELECT id, username, role, status FROM users WHERE username = %s AND password = %s",
            (test['username'], test['password'])
        )
        user = cursor.fetchone()
        result = user is not None
        status = "✓" if result == test['expected'] else "✗"
        print(f"  {status} 测试 {test['username']}:{test['password']} -> {'成功' if result else '失败'} (预期: {'成功' if test['expected'] else '失败'})")
    
    # 关闭连接
    cursor.close()
    conn.close()
    print("\n所有测试完成！")
    
except Exception as e:
    print(f"✗ 数据库测试失败: {e}")
