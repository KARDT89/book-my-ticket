CREATE TABLE seats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0
);

INSERT INTO seats (isbooked)
SELECT 0 FROM generate_series(1, 20);

CREATE TABLE USERS (
    id SERIAL PRIMARY KEY,
    name varchar(50),
    email VARCHAR(322) UNIQUE NOT NULL,
    password VARCHAR(66) NOT NULL,

    verificationToken VARCHAR(66),
    refreshToken TEXT,
    ResetPasswordToken VARCHAR(66),
    ResetPasswordExpires TIMESTAMP,

    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
