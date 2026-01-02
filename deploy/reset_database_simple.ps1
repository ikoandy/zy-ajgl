# Cloud Database Reset Script

# Database Configuration
$DB_HOST = "10.6.0.17"
$DB_PORT = 3306
$DB_USER = "root"
$DB_PASSWORD = "ZY520117."
$DB_NAME = "law_firm_management"

# Log function
function Log($message) {
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $message" -ForegroundColor Green
}

# Start database reset
Log "Starting cloud database reset..."
Log "==============================================="

# Check if MySQL client is installed
Log "Checking MySQL client..."
$mysqlInstalled = $false
try {
    $mysqlVersion = & mysql --version 2>&1
    if ($mysqlVersion -like "*mysql*Ver*") {
        $mysqlInstalled = $true
        Log "MySQL client is installed: $mysqlVersion"
    }
} catch {
    Log "Error checking MySQL client: $($_.Exception.Message)"
}

if (-not $mysqlInstalled) {
    Log "MySQL client not found. Please install MySQL client first."
    Log "Download link: https://dev.mysql.com/downloads/mysql/"
    exit 1
}

# Database reset SQL script
$resetSql = @"
-- Drop and recreate database
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $DB_NAME;

-- Create users table
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

-- Create cases table
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

-- Create clients table
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

-- Create documents table
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

-- Create financial table
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

-- Insert initial admin user (password: admin123)
INSERT INTO users (username, password, role, status) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnO8Qb4e06H6kCE.Lnq1a8d1eX5vZ7cV9x', 'admin', 1);

-- Insert test data
INSERT INTO users (username, password, role, status) VALUES 
('lawyer1', '$2a$10$N.zmdr9k7uOCQb376NoUnO8Qb4e06H6kCE.Lnq1a8d1eX5vZ7cV9x', 'lawyer', 1),
('client1', '$2a$10$N.zmdr9k7uOCQb376NoUnO8Qb4e06H6kCE.Lnq1a8d1eX5vZ7cV9x', 'client', 1);
"@

# Execute database reset
Log "Executing database reset commands..."
try {
    # Write SQL script to temporary file
    $tempSqlFile = "$env:TEMP\reset_database.sql"
    Set-Content -Path $tempSqlFile -Value $resetSql -Encoding UTF8
    
    Log "SQL script written to: $tempSqlFile"
    Log "Executing MySQL commands..."
    
    # Execute SQL script using mysql client
    $mysqlArgs = @(
        "-h", $DB_HOST,
        "-P", $DB_PORT,
        "-u", $DB_USER,
        "-p$DB_PASSWORD",
        "-D", $DB_NAME,
        "--execute", "source $tempSqlFile"
    )
    
    & mysql @mysqlArgs
    
    if ($LASTEXITCODE -eq 0) {
        Log "==============================================="
        Log "Cloud database reset successful!"
        Log "Database Name: $DB_NAME"
        Log "Initial Admin User:"
        Log "  Username: admin"
        Log "  Password: admin123"
        Log "==============================================="
    } else {
        Log "MySQL execution failed with exit code: $LASTEXITCODE"
        exit 1
    }
    
    # Clean up temporary file
    Remove-Item -Path $tempSqlFile -Force -ErrorAction SilentlyContinue
    
} catch {
    Log "Database reset failed: $($_.Exception.Message)"
    exit 1
}
