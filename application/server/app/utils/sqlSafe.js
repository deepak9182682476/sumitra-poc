// Safe values for SQL text (stops SQL injection).
// The queries in this project are plain strings (the DB helpers also queue them as strings while the
// database is down), so values are escaped here instead of being pasted into the SQL as they are.
// For normal input these produce exactly the same SQL as before; for injected SQL they quote it or refuse it.
// The models are looked up when a value is escaped, not when this file loads:
// models/index.js -> service/topic.js -> controllers load in a circle, so a reference taken at load
// time could be an unfinished, empty object.
const sequelize = () => require("../models").sequelize;

// A text value as a quoted, escaped SQL literal: str("O'Neil") -> 'O''Neil'
// (null / undefined become 'null' / 'undefined' text, as the old `'${value}'` did)
exports.str = (value) => sequelize().escape(String(value));

// A number, true/false or null. Anything else (for example "1; drop table users") is refused.
exports.num = (value) => {
  if (value === null) return "NULL";
  if (value === true || value === false) return String(value);
  if (typeof value === "string" && /^(true|false|null)$/i.test(value.trim())) return value.trim().toLowerCase();
  if (value === undefined || (typeof value === "string" && value.trim() === "")) {
    throw new Error("Missing number in request");
  }
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error("Invalid number in request");
  return String(n);
};

// A table or column name: letters, digits and underscore only, optionally schema.table (for example "uav", "public.zone").
exports.ident = (value) => {
  if (typeof value !== "string" || !/^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)?$/.test(value)) {
    throw new Error("Invalid name in request");
  }
  return value;
};

// Comma-separated list of numbers (for IN (...) lists and ARRAY[...]), each checked with num()
exports.numList = (values) => {
  const list = Array.isArray(values) ? values : String(values).split(",");
  return list.map((v) => exports.num(typeof v === "string" ? v.trim() : v)).join(", ");
};
