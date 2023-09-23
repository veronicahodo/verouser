/*
  verouser

  Basic user management helpers. Works
  with verogroups for complex user interactions

  Version 0.4.0
*/
import VeroCrud from "./verocrud";
import { sha512 } from "sha512-crypt-ts";

class VeroUser {
  table: string;
  fields: any;
  crud: VeroCrud;

  constructor(crud: VeroCrud) {
    this.table = "users";
    this.fields = {
      userId: 0,
      username: "",
      passwordHash: "",
      salt: "",
    };
    this.crud = crud;
  }

  passwordToHash(password: string, salt: string) {
    return sha512.crypt(password, salt);
  }

  create() {
    return this.crud.create(this.table, this.fields);
  }

  read(criteria: Array<Array<string>>) {
    return this.crud.read(this.table, criteria);
  }

  update(criteria: Array<Array<string>>) {
    return this.crud.update(this.table, this.fields, criteria);
  }

  delete(criteria: Array<Array<string>>) {
    if (this.fields.userId > 0) {
      return this.crud.delete(this.table, criteria);
    }
  }

  validatePassword(password: string) {
    // Calculates a password hash and compares it to
    // what we have loaded
    if (this.fields.userId > 0) {
      if (
        this.fields.passwordHash ===
        this.passwordToHash(password, this.fields.salt)
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  updatePassword(password: string) {
    if (this.fields.userId > 0) {
      this.fields.passwordHash = this.passwordToHash(
        password,
        this.fields.salt
      );
      this.update([["userId", "=", this.fields.userId]]);
    }
  }
}

export default VeroUser;
