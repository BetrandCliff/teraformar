import "server-only";
import { DataSource } from "typeorm";
export { isAdminAuthenticated, createAdminSession } from "@/lib/session";

const globalForTypeOrm = globalThis as typeof globalThis & {
  typeormDataSource?: DataSource;
  typeormDataSourcePromise?: Promise<DataSource>;
};

async function getDataSource() {
  if (globalForTypeOrm.typeormDataSource?.isInitialized) return globalForTypeOrm.typeormDataSource;
  if (globalForTypeOrm.typeormDataSourcePromise) return globalForTypeOrm.typeormDataSourcePromise;

  const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE } = process.env;
  if (!DB_HOST || !DB_USERNAME || !DB_PASSWORD || !DB_DATABASE) {
    throw new Error("PostgreSQL is not configured. Set DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, and DB_DATABASE.");
  }

  const dataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: Number(DB_PORT || 5432),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    synchronize: false,
    migrationsRun: false,
    logging: false,
    extra: { max: 10 },
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
  });
  const initializePromise = dataSource.initialize().then((connected) => {
    globalForTypeOrm.typeormDataSource = connected;
    return connected;
  });
  globalForTypeOrm.typeormDataSourcePromise = initializePromise;
  return initializePromise;
}

const tables = new Set(["users", "admins", "profiles", "projects", "project_images", "project_documents", "designs", "design_images", "documents", "services", "appointments", "messages", "site_settings"]);

function identifier(value: string) {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) throw new Error("Invalid database identifier");
  return `"${value}"`;
}
type RequestOptions = { method?: "GET" | "POST" | "PATCH" | "DELETE"; query?: string; body?: unknown; prefer?: string };

export async function typeormRequest<T>(table: string, options: RequestOptions = {}): Promise<T> {
  if (!tables.has(table)) throw new Error(`Table is not allowed: ${table}`);
  const query = new URLSearchParams((options.query ?? "").replace(/^\?/, ""));
  const filters: string[] = []; const values: unknown[] = [];
  for (const [key, value] of query) {
    if (["select", "order", "limit", "on_conflict"].includes(key)) continue;
    const match = /^(eq|neq|gt|gte|lt|lte|is|like|ilike)\.(.*)$/.exec(value);
    if (!match) continue;
    values.push(match[2]);
    const operators = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=", is: "IS NOT DISTINCT FROM", like: "LIKE", ilike: "ILIKE" } as const;
    const op = operators[match[1] as keyof typeof operators];
    filters.push(`${identifier(key)} ${op} $${values.length}`);
  }
  const where = filters.length ? ` WHERE ${filters.join(" AND ")}` : "";
  const method = options.method ?? "GET";
  const source = await getDataSource();

  if (method === "GET") {
    const columns = query.get("select") ?? "*";
    if (columns !== "*" && !columns.split(",").every((c) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(c.trim()))) throw new Error("Invalid selected columns");
    const order = query.get("order");
    const orderBy = order ? order.split(",").map((part) => { const [col, dir] = part.split("."); return `${identifier(col)} ${dir?.toLowerCase() === "desc" ? "DESC" : "ASC"}`; }).join(",") : "";
    const limit = Number(query.get("limit"));
    return source.query(`SELECT ${columns === "*" ? "*" : columns.split(",").map((c) => identifier(c.trim())).join(",")} FROM ${identifier(table)}${where}${orderBy ? ` ORDER BY ${orderBy}` : ""}${Number.isInteger(limit) && limit > 0 ? ` LIMIT ${Math.min(limit, 1000)}` : ""}`, values) as Promise<T>;
  }
  if (method === "DELETE") return source.query(`DELETE FROM ${identifier(table)}${where} RETURNING *`, values) as Promise<T>;

  const body = options.body as Record<string, unknown>;
  if (!body || typeof body !== "object" || Array.isArray(body) || !Object.keys(body).length) throw new Error("A database row is required");
  const keys = Object.keys(body); keys.forEach(identifier);
  const bodyValues = keys.map((key) => body[key]);
  if (method === "POST") {
    const names = keys.map(identifier).join(",");
    const slots = keys.map((_, i) => `$${i + 1}`).join(",");
    const conflict = query.get("on_conflict");
    const merge = (options.prefer ?? "").includes("resolution=merge-duplicates");
    const updates = keys.filter((key) => key !== conflict);
    const conflictSql = conflict && merge && updates.length ? ` ON CONFLICT (${identifier(conflict)}) DO UPDATE SET ${updates.map((key) => `${identifier(key)}=EXCLUDED.${identifier(key)}`).join(",")}` : conflict ? ` ON CONFLICT (${identifier(conflict)}) DO NOTHING` : "";
    return source.query(`INSERT INTO ${identifier(table)} (${names}) VALUES (${slots})${conflictSql} RETURNING *`, bodyValues) as Promise<T>;
  }
  if (!filters.length) throw new Error("Refusing to update a table without a filter");
  const setSql = keys.map((key, i) => `${identifier(key)}=$${values.length + i + 1}`).join(",");
  return source.query(`UPDATE ${identifier(table)} SET ${setSql}${where} RETURNING *`, [...values, ...bodyValues]) as Promise<T>;
}
