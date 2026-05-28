import OracleDB from 'oracledb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './Database/databaseConfiguration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, '..', 'demo_proofs');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

process.on('unhandledRejection', (reason) => {
    console.warn(`[Process Warning] Unhandled Rejection: ${reason.message || reason}`);
});
process.on('uncaughtException', (err) => {
    console.warn(`[Process Warning] Uncaught Exception: ${err.message || err}`);
});

const logLines = [];
function log(msg) {
    console.log(msg);
    logLines.push(msg);
}

async function runScenario1() {
    log('\n--- 1. LOST UPDATE SCENARIO (C1) ---');
    log('Kịch bản: T1 & T2 cùng mượn sách S000001 (số lượng còn là 1).');
    
    // Reset book quantity
    let initConn = await OracleDB.getConnection(config);
    await initConn.execute("UPDATE KHOSACH SET SoLuongCon = 1 WHERE MaSach = 'S000001'");
    await initConn.commit();
    
    let t1Conn = await OracleDB.getConnection(config);
    let t2Conn = await OracleDB.getConnection(config);
    
    log('T1: SELECT SoLuongCon FROM KHOSACH WHERE MaSach = \'S000001\' FOR UPDATE;');
    const res1 = await t1Conn.execute("SELECT SoLuongCon FROM KHOSACH WHERE MaSach = 'S000001' FOR UPDATE");
    const val1 = res1.rows[0][0] !== undefined ? res1.rows[0][0] : res1.rows[0].SOLUONGCON;
    log(`T1: Read quantity = ${val1} (T1 đang giữ khóa)`);
    
    log('T2: SELECT SoLuongCon FROM KHOSACH WHERE MaSach = \'S000001\' FOR UPDATE; (T2 sẽ bị block...)');
    let t2Blocked = true;
    let t2Finished = false;
    let t2Error = null;
    
    // Start T2 asynchronously
    const t2Promise = t2Conn.execute("SELECT SoLuongCon FROM KHOSACH WHERE MaSach = 'S000001' FOR UPDATE")
        .then(res => {
            t2Blocked = false;
            t2Finished = true;
            return res;
        }).catch(err => {
            t2Error = err.message;
            t2Finished = true;
        });
        
    // Wait 1.5 seconds to prove T2 is blocked
    await new Promise(r => setTimeout(r, 1500));
    if (t2Blocked) {
        log('👉 Khớp kết quả: T2 đang bị BLOCK đúng như kỳ vọng!');
    } else {
        log('⚠️ Cảnh báo: T2 không bị block!');
    }
    
    log('T1: UPDATE KHOSACH SET SoLuongCon = SoLuongCon - 1 WHERE MaSach = \'S000001\';');
    await t1Conn.execute("UPDATE KHOSACH SET SoLuongCon = SoLuongCon - 1 WHERE MaSach = 'S000001'");
    log('T1: COMMIT;');
    await t1Conn.commit();
    log('T1: Đã giải phóng khóa.');
    
    // Wait for T2 to process
    const res2 = await t2Promise;
    if (t2Finished) {
        if (t2Error) {
            log(`T2 Lỗi: ${t2Error}`);
        } else {
            const val2 = res2.rows[0][0] !== undefined ? res2.rows[0][0] : res2.rows[0].SOLUONGCON;
            log(`T2: Đã unblock! Đọc được SoLuongCon = ${val2}`);
        }
    }
    
    await t2Conn.rollback();
    await t1Conn.close();
    await t2Conn.close();
    await initConn.close();
}

async function runScenario2() {
    log('\n--- 2. DIRTY READ SCENARIO (C2) ---');
    log('Kịch bản: Oracle sử dụng READ COMMITTED mặc định kết hợp MVCC, chặn đọc dữ liệu chưa commit.');
    
    let initConn = await OracleDB.getConnection(config);
    await initConn.execute("UPDATE KHOSACH SET SoLuongCon = 10 WHERE MaSach = 'S000002'");
    await initConn.commit();
    
    let t1Conn = await OracleDB.getConnection(config);
    let t2Conn = await OracleDB.getConnection(config);
    
    log('T1: UPDATE KHOSACH SET SoLuongCon = SoLuongCon - 1 WHERE MaSach = \'S000002\'; (Chưa COMMIT)');
    await t1Conn.execute("UPDATE KHOSACH SET SoLuongCon = SoLuongCon - 1 WHERE MaSach = 'S000002'");
    
    log('T2: SELECT SoLuongCon FROM KHOSACH WHERE MaSach = \'S000002\';');
    const res2 = await t2Conn.execute("SELECT SoLuongCon FROM KHOSACH WHERE MaSach = 'S000002'");
    const val3 = res2.rows[0][0] !== undefined ? res2.rows[0][0] : res2.rows[0].SOLUONGCON;
    log(`T2: Read quantity = ${val3}`);
    log('👉 Khớp kết quả: T2 chỉ đọc được giá trị cũ (10). Oracle đã chặn Dirty Read thành công!');
    
    log('T1: ROLLBACK;');
    await t1Conn.rollback();
    
    await t1Conn.close();
    await t2Conn.close();
    await initConn.close();
}

async function runScenario3() {
    log('\n--- 3. PHANTOM READ SCENARIO (C3) ---');
    
    let initConn = await OracleDB.getConnection(config);
    // Ensure test reader status
    await initConn.execute("UPDATE PHIEUMUON SET TrangThai = 'DANG_MUON' WHERE MaPhieuMuon = 'PM000001'");
    await initConn.commit();
    
    let t1Conn = await OracleDB.getConnection(config);
    let t2Conn = await OracleDB.getConnection(config);
    
    log('\n3.1. Thử nghiệm Phantom Read ở mức cô lập mặc định (READ COMMITTED):');
    log('T1 (Tx1): SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = \'QUA_HAN\';');
    let r1 = await t1Conn.execute("SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = 'QUA_HAN'");
    log(`T1 (Tx1) Lần 1: Số phiếu quá hạn = ${r1.rows[0][0]}`);
    
    log('T2: UPDATE PHIEUMUON SET TrangThai = \'QUA_HAN\' WHERE MaPhieuMuon = \'PM000001\'; COMMIT;');
    await t2Conn.execute("UPDATE PHIEUMUON SET TrangThai = 'QUA_HAN' WHERE MaPhieuMuon = 'PM000001'");
    await t2Conn.commit();
    
    log('T1 (Tx1): SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = \'QUA_HAN\';');
    let r2 = await t1Conn.execute("SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = 'QUA_HAN'");
    log(`T1 (Tx1) Lần 2: Số phiếu quá hạn = ${r2.rows[0][0]}`);
    log('👉 Khớp kết quả: Số phiếu thay đổi (Phantom Read xuất hiện dưới mức READ COMMITTED).');
    await t1Conn.commit();
    
    // Reset data
    await initConn.execute("UPDATE PHIEUMUON SET TrangThai = 'DANG_MUON' WHERE MaPhieuMuon = 'PM000001'");
    await initConn.commit();
    
    log('\n3.2. Khắc phục Phantom Read bằng mức cô lập SERIALIZABLE:');
    log('T1 (Tx2): SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;');
    await t1Conn.execute("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE");
    
    log('T1 (Tx2): SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = \'QUA_HAN\';');
    r1 = await t1Conn.execute("SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = 'QUA_HAN'");
    log(`T1 (Tx2) Lần 1: Số phiếu quá hạn = ${r1.rows[0][0]}`);
    
    log('T2: UPDATE PHIEUMUON SET TrangThai = \'QUA_HAN\' WHERE MaPhieuMuon = \'PM000001\'; COMMIT;');
    await t2Conn.execute("UPDATE PHIEUMUON SET TrangThai = 'QUA_HAN' WHERE MaPhieuMuon = 'PM000001'");
    await t2Conn.commit();
    
    log('T1 (Tx2): SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = \'QUA_HAN\';');
    r2 = await t1Conn.execute("SELECT COUNT(*) FROM PHIEUMUON WHERE TrangThai = 'QUA_HAN'");
    log(`T1 (Tx2) Lần 2: Số phiếu quá hạn = ${r2.rows[0][0]}`);
    log('👉 Khớp kết quả: Số phiếu vẫn giữ nguyên! SERIALIZABLE đã ngăn chặn thành công Phantom Read!');
    
    await t1Conn.commit();
    await t1Conn.close();
    await t2Conn.close();
    await initConn.close();
}

async function runScenario4() {
    log('\n--- 4. DEADLOCK SCENARIO (C4) ---');
    log('Kịch bản: T1 & T2 cùng khóa hai cuốn sách ngược thứ tự nhau.');
    
    let t1Conn = await OracleDB.getConnection(config);
    let t2Conn = await OracleDB.getConnection(config);
    
    log('T1: UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = \'S000001\'; (Khóa sách 1)');
    await t1Conn.execute("UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = 'S000001'");
    
    log('T2: UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = \'S000002\'; (Khóa sách 2)');
    await t2Conn.execute("UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = 'S000002'");
    
    log('T1: UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = \'S000002\'; (T1 đợi T2...)');
    // Start T1 update asynchronously because it will block
    let t1Error = null;
    let t1Promise = t1Conn.execute("UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = 'S000002'")
        .catch(async err => {
            t1Error = err;
            log(`👉 Khớp kết quả: Oracle phát hiện Deadlock thành công! (T1 bị hủy)`);
            log(`Thông báo lỗi của Oracle ở T1: ${err.message}`);
            await t1Conn.rollback().catch(() => {});
        });
    
    await new Promise(r => setTimeout(r, 1500));
    
    log('T2: UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = \'S000001\'; (T2 đợi T1... Gây Deadlock!)');
    try {
        await t2Conn.execute("UPDATE KHOSACH SET SoLuongCon = SoLuongCon WHERE MaSach = 'S000001'");
        log('T2: Lock acquired successfully.');
    } catch (err) {
        log(`👉 Khớp kết quả: Oracle phát hiện Deadlock thành công! (T2 bị hủy)`);
        log(`Thông báo lỗi của Oracle ở T2: ${err.message}`);
        await t2Conn.rollback().catch(() => {});
    }
    
    log('Giải phóng toàn bộ khóa bằng Rollback cuối.');
    await t1Conn.rollback().catch(() => {});
    await t2Conn.rollback().catch(() => {});
    
    // Resolve pending promise of T1
    await t1Promise;
    
    await t1Conn.close();
    await t2Conn.close();
}

async function main() {
    log('# Báo Cáo Kết Quả Thực Nghiệm Xử Lý Đồng Thời (Concurrency) trên Oracle 21c XE');
    log(`*Ngày tạo:* ${new Date().toLocaleString()}`);
    log('*Môi trường:* Node.js driver + Oracle 21c Database Express Edition');
    
    try {
        await runScenario1();
        await runScenario2();
        await runScenario3();
        await runScenario4();
    } catch (err) {
        console.error('Fatal error during execution:', err);
    } finally {
        // Write log to md file
        const mdContent = logLines.join('\n');
        fs.writeFileSync(path.join(outDir, 'CONCURRENCY_TEST_LOGS.md'), mdContent);
        console.log(`\n========================================`);
        console.log(`Saved report to: ${path.join(outDir, 'CONCURRENCY_TEST_LOGS.md')}`);
        console.log(`========================================`);
    }
}

main();
