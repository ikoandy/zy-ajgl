import pymysql

# 数据库配置
DB_CONFIG = {
    'host': '10.6.0.17',
    'port': 3306,
    'user': 'root',
    'password': 'ZY520117.',
    'database': 'law_firm_management',
    'charset': 'utf8mb4'
}

# 必要的初始用户数据（需要保留）
REQUIRED_USERS = [
    {'username': 'admin', 'password': 'admin123', 'role': 'admin'},
    {'username': 'lawyer1', 'password': 'lawyer123', 'role': 'lawyer'},
    {'username': 'client1', 'password': 'client123', 'role': 'client'}
]

def cleanup_data():
    try:
        # 连接到数据库
        conn = pymysql.connect(**DB_CONFIG)
        conn.autocommit(True)
        cursor = conn.cursor()
        
        print("开始清理系统模拟数据...")
        
        # 1. 清理文档表数据
        cursor.execute("DELETE FROM documents WHERE id > 0")
        print("✓ 已清理文档表数据")
        
        # 2. 清理财务表数据
        cursor.execute("DELETE FROM financial WHERE id > 0")
        print("✓ 已清理财务表数据")
        
        # 3. 清理案例表数据
        cursor.execute("DELETE FROM cases WHERE id > 0")
        print("✓ 已清理案例表数据")
        
        # 4. 清理客户表数据
        cursor.execute("DELETE FROM clients WHERE id > 0")
        print("✓ 已清理客户表数据")
        
        # 5. 清理用户表，只保留必要的初始用户
        # 先删除所有用户
        cursor.execute("DELETE FROM users WHERE id > 0")
        # 重新插入必要的初始用户
        for user in REQUIRED_USERS:
            cursor.execute(
                "INSERT INTO users (username, password, role, status) VALUES (%s, %s, %s, %s)",
                (user['username'], user['password'], user['role'], 1)
            )
        print(f"✓ 已清理用户表数据，保留了 {len(REQUIRED_USERS)} 个必要的初始用户")
        
        # 6. 重置自增ID
        cursor.execute("ALTER TABLE users AUTO_INCREMENT = 1")
        cursor.execute("ALTER TABLE cases AUTO_INCREMENT = 1")
        cursor.execute("ALTER TABLE clients AUTO_INCREMENT = 1")
        cursor.execute("ALTER TABLE financial AUTO_INCREMENT = 1")
        cursor.execute("ALTER TABLE documents AUTO_INCREMENT = 1")
        print("✓ 已重置所有表的自增ID")
        
        print("\n模拟数据清理完成！")
        print("\n系统现在包含以下初始数据：")
        cursor.execute("SELECT id, username, role, status FROM users")
        users = cursor.fetchall()
        for user in users:
            print(f"  - 用户ID: {user[0]}, 用户名: {user[1]}, 角色: {user[2]}, 状态: {user[3]}")
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"✗ 清理数据失败: {e}")
        return False

if __name__ == "__main__":
    cleanup_data()