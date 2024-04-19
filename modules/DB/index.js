const mysql = require("mysql")

// database method class
class DB {
    constructor(pool) {
        this.pool = pool;
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });
    }

    query(sql, values) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, values, (err, results) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(results);
                }
            });
        });
    }

    release_connect(connection) {
        return new Promise((resolve, reject) => {
            try {
                connection.release()
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            this.pool.end((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    testDB() {
        return new Promise(async (resolve, reject) => {
            try {
                let conn = await this.connect()
                await this.release_connect(conn)
                resolve(`database connection ok`)
            } catch (error) {
                reject(`can't connect to database server\n${error}`)
            }
        })
    }

    insert_data(tablename, data) {
        return new Promise(async (resolve, reject) => {
            try {
                const sql = `INSERT INTO ${tablename} SET ?`
                let inserted = await this.query(sql, data)
                resolve(inserted)
            } catch (error) {
                reject(error)
            }
        })
    }

    login(uname) {
        return new Promise(async (resolve, reject) => {
            try {
                const sql = "SELECT * FROM users_table WHERE user_uname=?";
                let login_res = await this.query(sql, uname)
                // console.log(login_res)
                resolve(login_res)
            } catch (error) {
                reject(error)
            }
        })
    }
}



module.exports = DB
