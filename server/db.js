/**
 * db.js — MySQL2 connection pool.
 *
 * IMPORTANT: Always use '127.0.0.1' not 'localhost' as the default host.
 * On Linux, 'localhost' resolves to the IPv6 address ::1, but MySQL user
 * grants are typically for 127.0.0.1 (IPv4). Using ::1 causes
 * "Access denied for user ...@'::1'" even with the correct password.
 */

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:               process.env.DB_HOST     || '127.0.0.1',
  port:               parseInt(process.env.DB_PORT || '3306', 10),
  user:               process.env.DB_USER     || 'root',
  password:           process.env.DB_PASSWORD || '',
  database:           process.env.DB_NAME     || 'jpos',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  decimalNumbers:     true,
});

export default pool;
