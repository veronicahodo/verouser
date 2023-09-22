/*
  verocrud

  A CRUD based module for me to use to do my various
  basic database stuff.

  Version 0.4.0 - last updated 2023-09-22
*/
import * as mysql from "mysql2/promise";

class VeroCrud {
  private pool: mysql.Pool;
  private maxResults: number;

  constructor(
    username: string,
    password: string,
    database: string,
    host: string = "localhost"
  ) {
    this.pool = mysql.createPool({
      host: host,
      user: username,
      password: password,
      database: database,
    });
    this.maxResults = 20000; // Change as needed. If you have larger record sets increase this
  }

  private insertString(data: any[]) {
    // This builds the string of fields and values necessary
    // for SQL
    // TODO: I know we should trust our code to be used properly
    // but I can't help but think we should do some sanitization
    // on these fields
    let fields: string[] = [];
    let values: any[] = [];
    for (const item of data) {
      Object.entries(item).forEach(([key, value]) => {
        fields.push(key);
        values.push(value);
      });
    }
    return `(${fields.join(",")}) VALUES ('${values.join("','")}')`;
  }

  private updateString(data: any[]) {
    // This builds the update string
    // TODO: same security concerns as insert
    let fields: string[] = [];
    let values: any[] = [];
    let returnStr: string = "";
    for (const item of data) {
      Object.entries(item).forEach(([key, value]) => {
        fields.push(key);
        values.push(value);
      });
    }
    for (var i = 0; i < fields.length; i++) {
      if (i > 0) {
        returnStr += ", ";
      }
      returnStr += `${fields[i]}="${values[i]}"`;
    }
    return returnStr;
  }

  private criteriaToString(
    criteria: Array<Array<any>>,
    orOperand: boolean = false
  ): string {
    // This function converts an array of arrays to an SQL
    // query critera. Expects each criteria to be in its
    // own 3 element array within the parent array. Default
    // is to join each of these with an AND statement. Setting
    // orOperand true replaces that with OR
    /* [
      [{
        field,      -- appropriate column name
        operand,    -- operator. =,<,>,LIKE
        value       -- value to compare
      }]
    ]
    */
    let returnStr = "(";
    let count = 0;
    const operand = orOperand ? "OR" : "AND";

    for (const item of criteria) {
      if (count > 0) {
        returnStr += ` ${operand} `;
      }
      returnStr += `${item[0]} ${item[1]}'`;

      if (item[1].toLowerCase() === "like") {
        returnStr += `%${item[2]}%'`;
      } else {
        returnStr += `${item[2]}'`;
      }

      count++;
    }

    return returnStr + ")";
  }

  async create(table: string, data: any): Promise<void> {
    // Creates a new entry in the database
    const connection = await this.pool.getConnection();
    try {
      const sql: string = `INSERT INTO \`${table}\` ${this.insertString(data)}`;
      console.log(sql);
      await connection.query(sql);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async read(
    table: string,
    criteria: Array<Array<string>>
  ): Promise<any | null> {
    // Performs a pretty flexible select statement coupled with
    // criteriaToString.
    const connection = await this.pool.getConnection();

    try {
      let sql: string = `SELECT * FROM \`${table}\` WHERE ${this.criteriaToString(
        criteria
      )} LIMIT ${this.maxResults}`;
      console.log(sql);
      const [rows] = await connection.query(sql);
      if (rows.length > 0) {
        console.log(rows);
        return rows[0];
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(
    table: string,
    data: any[],
    criteria: Array<Array<string>>
  ): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      let sql: string =
        `UPDATE ${table} SET ${this.updateString(data)} ` +
        `WHERE ${this.criteriaToString(criteria)}` +
        ` LIMIT ${this.maxResults} `;
      console.log(sql);
      await connection.query(sql);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }

  async delete(table: string, criteria: Array<Array<string>>): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      let sql: string =
        `DELETE FROM ${table} WHERE ${this.criteriaToString(criteria)} LIMIT ` +
        this.maxResults;
      await connection.query(sql);
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default VeroCrud;
