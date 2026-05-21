import OracleDB from 'oracledb';
import { config } from './Database/databaseConfiguration.js';

async function run() {
  console.log("Connecting...");
  let conn;
  try {
    conn = await OracleDB.getConnection(config);
    console.log("Connected successfully!");
    
    // Check NLS parameters
    const nls = await conn.execute(
      `SELECT parameter, value FROM nls_database_parameters WHERE parameter IN ('NLS_CHARACTERSET', 'NLS_NCHAR_CHARACTERSET')`
    );
    console.log("--- NLS DATABASE PARAMETERS ---");
    nls.rows.forEach(row => console.log(row[0] || row.PARAMETER, ":", row[1] || row.VALUE));

    // Check actual text of SP_TAO_PHIEU_MUON
    const result = await conn.execute(
      `SELECT TEXT, LINE FROM USER_SOURCE WHERE NAME = 'SP_TAO_PHIEU_MUON' ORDER BY LINE`
    );
    console.log("--- SP_TAO_PHIEU_MUON SOURCE ---");
    result.rows.forEach((row) => {
      const text = row[0] || row.TEXT;
      const line = row[1] || row.LINE;
      if (text.includes('Th') || text.includes('hạn') || text.includes('độc') || text.includes('RAISE')) {
        console.log(`${line}:`, text.trim());
      }
    });

  } catch (err) {
    console.error("Error:", err);
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

run();
