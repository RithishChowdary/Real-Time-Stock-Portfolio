CREATE DATABASE stock_portfolio IF NOT EXIST;
-- user table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_at DATETIME
);

-- Portfolio Entity
CREATE TABLE IF NOT EXISTS portfolios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_name VARCHAR(255) NOT NULL,
    created_at DATETIME,
    user_id BIGINT NOT NULL,

    CONSTRAINT fk_portfolio_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

-- Stock Entity

CREATE TABLE IF NOT EXISTS stocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(255) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    current_price DECIMAL(15,2) NOT NULL,
    last_updated DATETIME
);

-- TransactionTable

CREATE TABLE IF NOT EXISTS transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    buy_price DECIMAL(15,2) NOT NULL,
    transaction_type VARCHAR(255) NOT NULL,
    transaction_date DATETIME,

    CONSTRAINT fk_transaction_portfolio
        FOREIGN KEY (portfolio_id)
        REFERENCES portfolios(id),
        
    CONSTRAINT fk_transaction_stock
        FOREIGN KEY (stock_id)
        REFERENCES stocks(id)
);

--Alert Entity
CREATE TABLE IF NOT EXISTS alerts (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    target_price DECIMAL(38,2),
    stop_loss DECIMAL(38,2),
    profit_percentage DOUBLE,
    loss_percentage DOUBLE,
    active BIT,

    CONSTRAINT fk_alert_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_alert_stock
        FOREIGN KEY (stock_id)
        REFERENCES stocks(id)
);

--Notification Entity

CREATE TABLE IF NOT EXISTS notifications (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BIT,
    created_at DATETIME,

    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);