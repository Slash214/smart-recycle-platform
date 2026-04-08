let MYSQL_CONF = {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    prot: process.env.MYSQL_PORT || '3306',
    database: process.env.MYSQL_DATABASE || 'sm-db',
}

module.exports = { MYSQL_CONF }
