# 云数据库重置脚本

# 数据库配置
$DB_HOST = "10.6.0.17"
$DB_PORT = 3306
$DB_USER = "root"
$DB_PASSWORD = "ZY520117."
$DB_NAME = "law_firm_management"

# 打印信息
function Log($message) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $message" -ForegroundColor Green
}

# 开始重置数据库
Log "开始重置云数据库..."
Log "==============================================="

# 检查MySQL客户端是否已安装
Log "检查MySQL客户端..."
try {
    $mysqlVersion = mysql --version 2>$null
    if (-not $mysqlVersion) {
        Log "MySQL客户端未安装，正在安装..."
        # 对于Windows，我们可以使用choco或直接下载
        if (Get-Command choco -ErrorAction SilentlyContinue) {
            choco install mysql-cli -y
        } else {
            Log "请手动安装MySQL客户端：https://dev.mysql.com/downloads/mysql/"
            exit 1
        }
    }
    Log "MySQL客户端已安装"
} catch {
    Log "MySQL客户端检查失败：$($_.Exception.Message)"
    exit 1
}

# 数据库重置SQL脚本
$resetSql = @"
-- 删除并重新创建数据库
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $DB_NAME;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    email VARCHAR(100),
    phone VARCHAR(20),
    status TINYINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建案件表
CREATE TABLE IF NOT EXISTS cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_number VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    client_id INT NOT NULL,
    lawyer_id INT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id),
    FOREIGN KEY (lawyer_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建客户表
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建文档表
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建财务表
CREATE TABLE IF NOT EXISTS financial (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES cases(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建初始管理员用户（密码：admin123）
INSERT INTO users (username, password, role, status) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnO8Qb4e06H6kCE.Lnq1a8d1eX5vZ7cV9x', 'admin', 1);

-- 插入一些测试数据
INSERT INTO users (username, password, role, status) VALUES 
('lawyer1', '$2a$10$N.zmdr9k7uOCQb376NoUnO8Qb4e06H6kCE.Lnq1a8d1eX5vZ7cV9x', 'lawyer', 1),
('client1', '$2a$10$N.zmdr9k7uOCQb376NoUnO8Qb4e06H6kCE.Lnq1a8d1eX5vZ7cV9x', 'client', 1);

Log "数据库重置完成！"
Log "初始管理员用户："
Log "  用户名：admin"
Log "  密码：admin123"
"@

# 执行数据库重置
Log "执行数据库重置命令..."
try {
    # 将SQL脚本写入临时文件
    $tempSqlFile = [System.IO.Path]::GetTempFileName() + ".sql"
    Set-Content -Path $tempSqlFile -Value $resetSql -Encoding UTF8
    
    # 执行SQL脚本
    $mysqlCommand = "mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p'$DB_PASSWORD' < '$tempSqlFile'"
    Invoke-Expression $mysqlCommand
    
    # 删除临时文件
    Remove-Item $tempSqlFile -Force
    
    Log "==============================================="
    Log "云数据库重置成功！"
    Log "数据库名称：$DB_NAME"
    Log "初始管理员：admin / admin123"
    Log "==============================================="
    
} catch {
    Log "数据库重置失败：$($_.Exception.Message)"
    exit 1
}
