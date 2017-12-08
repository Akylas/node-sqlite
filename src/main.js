/**
 * SQLite client library for Node.js applications
 *
 * Copyright © 2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Database from './Database';
import {
  EventEmitter
} from 'events';
const promise = Promise;
const db = new Database(null, {
  Promise: promise
});

class TiSTMt {
  constructor(resultSet) {
    this.resultSet = resultSet;
  }

  finalize() {
    if (this.resultSet)
    this.resultSet.close();
  }
  get() {
    if (this.resultSet)
    return this.resultSet.getField(0);
  }
  all() {
    if (this.resultSet)
    return this.resultSet.all();
  }
  get lastID() {
    if (this.resultSet)
    return this.resultSet.lastInsertRowId;
  }

}

class TiDBDriver extends EventEmitter {
  constructor(filename, mode, callback) {
    super();
    this.isInstanceWithTransaction = true;
    try {
      this.db = Ti.Database.open(filename);
      callback && callback();
    } catch (err) {
      if (callback){
        callback(err);
      } else {
        throw err;
      }
    }
  }
  close() {
    try {
      this.db.close();
      callback && callback();
    } catch (err) {
      if (callback){
        callback(err);
      } else {
        throw err;
      }
    }
  }
  exec(sql, callback) {
    try {
      let result = this.db.executeStatements(sql);
      callback && callback();
    } catch (err) {
      if (callback){
        callback(err);
      } else {
        throw err;
      }
    }
  }
  run(sql, params, callback) {
    if (!callback && typeof params === 'function') {
      callback = params;
      params = undefined;
    }
    try {
      let result = this.db.execute(sql, params);
      let statement = new TiSTMt(result);
      callback && callback.call(statement, null);
    } catch (err) {
      if (callback){
        callback(err);
      } else {
        throw err;
      }
    }
  }
  all(sql, params, callback) {
    if (!callback && typeof params === 'function') {
      callback = params;
      params = undefined;
    }
    try {
      let result = this.db.execute(sql, params);
      let statement = new TiSTMt(result);
      callback && callback(null, result.all());
      statement.finalize();
    } catch (err) {
      if (callback){
        callback(err);
      } else {
        throw err;
      }
    }
  }

  get(sql, params, callback) {
    if (!callback && typeof params === 'function') {
      callback = params;
      params = undefined;
    }
    try {
      let result = this.db.execute(sql, params);
      let statement = new TiSTMt(result);
      callback && callback(null, result.all()[0]);
      statement.finalize();
    } catch (err) {
      if (callback){
        callback(err);
      } else {
        throw err;
      }
    }
  }
}

/**
 * Opens SQLite database.
 *
 * @returns Promise<Database> A promise that resolves to an instance of SQLite database client.
 */
db.open = (filename, {
  mode = null,
  verbose = false,
  Promise = promise,
  cached = false
} = {}) => {
  let driver;
  let DBDriver = TiDBDriver;

  // if (cached) {
  //   DBDriver = sqlite3.cached.Database;
  // }

  // if (verbose) {
  //   sqlite3.verbose();
  // }

  return new Promise((resolve, reject) => {
    driver = new DBDriver(filename, mode, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }).then(() => {
    db.driver = driver;
    db.Promise = Promise;
    return new Database(driver, {
      Promise
    });
  });
};

module.exports = exports = db;
