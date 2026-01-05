import pymysql

# 数据库配置
DB_CONFIG = {
    'host': '10.6.0.17',
    'port': 3306,
    'user': 'root',
    'password': 'ZY520117.',
    'charset': 'utf8mb4'
}

DB_NAME = 'law_firm_management'

def test_db_connection():
    try:
        print("测试数据库连接...")
        
        # 测试连接到MySQL服务器
        conn = pymysql.connect(**DB_CONFIG)
        print("✓ 成功连接到MySQL服务器")
        
        # 测试创建数据库（如果不存在）
        conn.autocommit(True)
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"✓ 成功创建或确认数据库 {DB_NAME} 存在")
        
        # 测试连接到特定数据库
        conn.close()
        db_config_with_db = {
            **DB_CONFIG,
            'database': DB_NAME
        }
        conn = pymysql.connect(**db_config_with_db)
        print(f"✓ 成功连接到数据库 {DB_NAME}")
        
        # 测试执行SQL查询
        cursor = conn.cursor()
        cursor.execute("SELECT 1 + 1 AS result")
        result = cursor.fetchone()
        print(f"✓ 成功执行SQL查询，结果：{result}")
        
        # 关闭连接
        cursor.close()
        conn.close()
        
        print("\n所有测试通过！云服务器成功连接到云数据库。")
        return True
    except Exception as e:
        print(f"✗ 数据库连接测试失败：{e}")
        return False

if __name__ == "__main__":
    test_db_connection()