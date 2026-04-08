/**
 * @description sequelize 同步数据库
 * @author 爱呵呵
 */
require("dotenv").config();
const seq = require("./seq");
require("./models/index");

// 测试链接
seq
  .authenticate()
  .then(() => {
    console.log("auth ok");
  })
  .catch(() => {
    console.log("auth err");
  });

// 执行同步
const isProduction = process.env.NODE_ENV === "production";
const forceSync = process.env.DB_SYNC_FORCE === "true";

if (isProduction && forceSync) {
  console.error("refuse to run sync with force=true in production");
  process.exit(1);
}

const syncOptions = forceSync ? { force: true } : {};
console.log(`sync start, force=${forceSync}`);

seq.sync(syncOptions).then(() => {
  console.log("sync ok");
  process.exit();
});
