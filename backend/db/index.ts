import { SQLDatabase } from "encore.dev/storage/sqldb";

export default new SQLDatabase("medicaid_db", {
  migrations: "./migrations",
});
