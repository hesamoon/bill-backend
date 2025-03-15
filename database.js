import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: "utf8mb4",
  })
  .promise();

export async function initializeDatabase() {
  await pool.query(
    `CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE}`
  );
  await pool.query(`USE ${process.env.MYSQL_DATABASE}`);

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS
      billInfo (
          id INT PRIMARY KEY AUTO_INCREMENT,
          billNumber INT NOT NULL,
          exporterName VARCHAR(50) NOT NULL,
          payMethod VARCHAR(50) NOT NULL,
          senderInfo JSON,
          receiverInfo JSON,
          productInfo JSON,
          priceInfo JSON,
          created TIMESTAMP NOT NULL DEFAULT NOW()
      )
  `;

  await pool.query(createTableQuery);

  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS
      users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          number VARCHAR(50) NOT NULL,
          password VARCHAR(50) NOT NULL,
          role VARCHAR(50) NOT NULL
      )
  `;

  await pool.query(createUserTableQuery);

  await pool.query("INSERT INTO users (number, password, role) VALUES ('09394832148', '12345678', 'ADMIN')")
}

export async function getBills() {
  const [rows] = await pool.query("SELECT * FROM billInfo");
  return rows;
}

export async function getBill(id) {
  const [rows] = await pool.query(
    `
    SELECT * 
    FROM billInfo
    WHERE id=?`,
    [id]
  );
  return rows[0];
}
export async function getUser(number, password) {
  const [rows] = await pool.query(
    `
    SELECT * 
    FROM users
    WHERE number=? AND password=?`,
    [number, password]
  );
  return rows;
}

export async function createBill(
  billNumber,
  exporterName,
  payMethod,
  senderInfo,
  receiverInfo,
  productInfo,
  priceInfo
) {
  const [result] = await pool.query(
    `
    INSERT INTO
        billInfo (
            billNumber,
            exporterName,
            payMethod,
            senderInfo,
            receiverInfo,
            productInfo,
            priceInfo
        )
    VALUES
        (
            ?,
            ?,
            ?,
            JSON_OBJECT('name', ?, 'phone', ?, 'desc', ?, 'address', JSON_OBJECT('state', JSON_OBJECT('id', ?, 'name', ?, 'slug', ?, 'tel_prefix', ?), 'city',JSON_OBJECT('id', ?, 'name', ?, 'slug', ?, 'province_id', ?), 'street', ?, 'alley', ?, 'postalCode', ?)),
            JSON_OBJECT('name', ?, 'phone', ?, 'desc', ?, 'address', JSON_OBJECT('state', JSON_OBJECT('id', ?, 'name', ?, 'slug', ?, 'tel_prefix', ?), 'city',JSON_OBJECT('id', ?, 'name', ?, 'slug', ?, 'province_id', ?), 'street', ?, 'alley', ?, 'postalCode', ?)),
            JSON_OBJECT(
                'productType', ?,
                'weight', ?,
                'culcWeight', ?,
                'count', ?,
                'content', ?,
                'dim', JSON_OBJECT('w', ?, 'h', ?, 'l', ?)
            ),
            JSON_OBJECT(
                'perKilo', ?,
                'shipping', ?,
                'service', ?,
                'collect', ?,
                'packaging', ?,
                'stamp', ?,
                'xry', ?,
                'representative', ?,
                'dispensation', ?,
                'tax', ?
            )
        )
  `,
    [
      billNumber,
      exporterName,
      payMethod,
      senderInfo.name,
      senderInfo.phone,
      senderInfo.desc,
      senderInfo.address.state ? senderInfo.address.state.id : "",
      senderInfo.address.state ? senderInfo.address.state.name : "",
      senderInfo.address.state ? senderInfo.address.state.slug : "",
      senderInfo.address.state ? senderInfo.address.state.tel_prefix : "",
      senderInfo.address.city ? senderInfo.address.city.id : "",
      senderInfo.address.city ? senderInfo.address.city.name : "",
      senderInfo.address.city ? senderInfo.address.city.slug : "",
      senderInfo.address.city ? senderInfo.address.city.province_id : "",
      senderInfo.address.street,
      senderInfo.address.alley,
      senderInfo.address.postalCode,
      receiverInfo.name,
      receiverInfo.phone,
      receiverInfo.desc,
      receiverInfo.address.state ? receiverInfo.address.state.id : "",
      receiverInfo.address.state ? receiverInfo.address.state.name : "",
      receiverInfo.address.state ? receiverInfo.address.state.slug : "",
      receiverInfo.address.state ? receiverInfo.address.state.tel_prefix : "",
      receiverInfo.address.city ? receiverInfo.address.city.id : "",
      receiverInfo.address.city ? receiverInfo.address.city.name : "",
      receiverInfo.address.city ? receiverInfo.address.city.slug : "",
      receiverInfo.address.city ? receiverInfo.address.city.province_id : "",
      receiverInfo.address.street,
      receiverInfo.address.alley,
      receiverInfo.address.postalCode,
      productInfo.productType,
      productInfo.weight,
      productInfo.culcWeight,
      productInfo.count,
      productInfo.content,
      productInfo.dim.w,
      productInfo.dim.h,
      productInfo.dim.l,
      priceInfo.perKilo,
      priceInfo.shipping,
      priceInfo.service,
      priceInfo.collect,
      priceInfo.packaging,
      priceInfo.stamp,
      priceInfo.xry,
      priceInfo.representative,
      priceInfo.dispensation,
      priceInfo.tax,
    ]
  );

  const id = result.insertId;
  return getBill(id);
}

// const notes = await getNotes();
// const note = await getNote(1);
// const res = await createNote("test", "test");
// console.log(res);
