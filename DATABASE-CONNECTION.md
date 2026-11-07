# Aiven MySQL connection

The PHP application connects through [`server/config.php`](./server/config.php). It now reads connection settings from environment variables and requires a CA certificate for verified TLS. No Aiven credentials or certificates belong in source control.

## Required environment variables

Set these in the PHP hosting/runtime environment (or the environment inherited by the local Apache/PHP process):

| Variable | Value |
|---|---|
| `DB_HOST` | Aiven service hostname, not `localhost` or the whole connection URL. |
| `DB_PORT` | Aiven service port. |
| `DB_NAME` | Database name on the Aiven service. |
| `DB_USER` | Aiven database username. |
| `DB_PASSWORD` | Aiven database password. |
| `DB_SSL_CA` | Absolute path, on the PHP server, to the Aiven CA certificate PEM file. |

In Aiven, open the MySQL service's connection information to copy the host, port, database, and username, and download its CA certificate. Keep the password in the hosting provider's secret/environment-variable settings. The PHP server must be able to read the CA file. `server/config.php` enables PDO exception mode, native prepared statements, UTF-8, UTC session time, CA-based TLS, and server-certificate verification.

For local Windows development, set these as user/system environment variables or configure them for the Apache service, then restart Apache so its PHP process inherits them. Environment variables set only in a terminal are not automatically available to a separately running Apache service. Do not put credentials in `config.php`, JavaScript, a committed `.env` file, or browser code. Do not share the database password in chat.

## Which database to select

The existing PHP pages and family handler expect the legacy tables in `bgry_profiling`. The proposed migration creates a new, separate database named `barangay_san_isidro`, with a different schema. Changing `DB_NAME` to the new database does **not** make the legacy PHP queries compatible; they must first be deliberately migrated/updated and tested.

Choose the database whose schema matches the code you are running. The migration file is not run by the PHP connection settings.

## Connection diagnostics

If settings are missing, the PHP connection stays unavailable and `$errorMessage` identifies missing variable names without showing their values. If PDO cannot connect, the full driver error is written to the PHP server error log while the application receives a generic message.

Check:

1. The Aiven service is running and its hostname/port/database/user are copied exactly.
2. The PHP runtime has `pdo_mysql` enabled.
3. The CA certificate path exists and is readable by the PHP/Apache process.
4. The Aiven service accepts network connections from the PHP host.
5. The configured database name matches the schema expected by the PHP code.
