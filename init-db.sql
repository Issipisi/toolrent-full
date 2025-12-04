-- Create databases if they don't exist
CREATE DATABASE IF NOT EXISTS toolrent_db;
CREATE DATABASE IF NOT EXISTS keycloak;

-- Grant privileges
GRANT ALL PRIVILEGES ON toolrent_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON keycloak.* TO 'root'@'%';
FLUSH PRIVILEGES;