const mysql = require("mysql2");

export class TestService {
  async selectAll(): Promise<any> {
    try {
      let connection = await mysql.createPool({
        host: "localhost",
        user: "admin",
        password: "Ab98765432#",
        database: "mysql"
      });
      return new Promise((res, rej) => {
        connection.execute("SHOW TABLES", (e, results) => {
          if (e) throw e;
          console.log(results);
          res(results);
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
}
