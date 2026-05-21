import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OracleDB from 'oracledb';
import { config } from './Database/databaseConfiguration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseSqlScript(sqlText) {
  const lines = sqlText.split(/\r?\n/);
  const statements = [];
  let currentStmt = [];
  let inPLSQL = false;

  for (let line of lines) {
    let trimmed = line.trim();
    if (trimmed.startsWith('--')) {
      continue;
    }

    if (!inPLSQL) {
      const upper = trimmed.toUpperCase();
      if (
        upper.startsWith('DECLARE') ||
        upper.startsWith('BEGIN') ||
        upper.startsWith('CREATE OR REPLACE TRIGGER') ||
        upper.startsWith('CREATE OR REPLACE FUNCTION') ||
        upper.startsWith('CREATE OR REPLACE PROCEDURE') ||
        upper.startsWith('CREATE TRIGGER') ||
        upper.startsWith('CREATE FUNCTION') ||
        upper.startsWith('CREATE PROCEDURE')
      ) {
        inPLSQL = true;
      }
    }

    if (inPLSQL) {
      if (trimmed === '/') {
        statements.push(currentStmt.join('\n'));
        currentStmt = [];
        inPLSQL = false;
      } else {
        currentStmt.push(line);
      }
    } else {
      if (trimmed === '') continue;
      currentStmt.push(line);
      if (trimmed.endsWith(';')) {
        let stmtText = currentStmt.join('\n').trim();
        if (stmtText.endsWith(';')) {
          stmtText = stmtText.slice(0, -1);
        }
        statements.push(stmtText);
        currentStmt = [];
      }
    }
  }

  if (currentStmt.length > 0) {
    let stmtText = currentStmt.join('\n').trim();
    if (stmtText.endsWith(';')) {
      stmtText = stmtText.slice(0, -1);
    }
    if (stmtText !== '/' && stmtText !== '') {
      statements.push(stmtText);
    }
  }

  return statements;
}

async function runFile(conn, relativePath) {
  const sqlFilePath = path.join(__dirname, '..', relativePath);
  console.log(`\n========================================`);
  console.log(`Running SQL file: ${sqlFilePath}`);
  console.log(`========================================`);
  
  const sqlText = fs.readFileSync(sqlFilePath, 'utf8');
  const statements = parseSqlScript(sqlText);
  console.log(`Parsed ${statements.length} statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.trim().split('\n')[0];
    try {
      await conn.execute(stmt);
      console.log(`[${i+1}/${statements.length}] Success: ${preview}`);
    } catch (err) {
      console.error(`[${i+1}/${statements.length}] Failed to execute: ${preview}`);
      console.error(err.message);
    }
  }
}

async function run() {
  console.log("Connecting to database...");
  let conn;
  try {
    conn = await OracleDB.getConnection(config);
    console.log("Connected successfully!");

    // Run the 3 scripts in order
    await runFile(conn, 'Database/01_HQTCSDL_Schema.sql');
    await runFile(conn, 'Database/02_HQTCSDL_Procedures_Triggers.sql');
    await runFile(conn, 'Database/03_HQTCSDL_Demo_Data.sql');

    // Auto commit just in case
    await conn.commit();
    console.log("\nDatabase reset complete and committed successfully!");

    console.log("\nVerifying USER_SOURCE encoding for SP_TAO_PHIEU_MUON...");
    const result = await conn.execute(
      `SELECT TEXT, LINE FROM USER_SOURCE WHERE NAME = 'SP_TAO_PHIEU_MUON' ORDER BY LINE`
    );
    result.rows.forEach((row) => {
      const text = row[0] || row.TEXT;
      const line = row[1] || row.LINE;
      if (text.includes('Th') || text.includes('hạn') || text.includes('độc') || text.includes('RAISE')) {
        console.log(`${line}:`, text.trim());
      }
    });

  } catch (err) {
    console.error("Database reset script failed:", err);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

run();
