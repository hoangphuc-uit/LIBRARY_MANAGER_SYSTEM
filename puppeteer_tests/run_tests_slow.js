const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'minh_chung_2');
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
    console.log('Khoi dong trinh duyet...');
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: { width: 1280, height: 800 },
        args: ['--start-maximized'] // Start browser maximized to be visible
    });
    const page = await browser.newPage();

    // Helper to type with very slow and natural delay
    const typeInput = async (selector, text) => {
        await page.waitForSelector(selector);
        await page.type(selector, text, { delay: 180 }); // 180ms delay between keystrokes
        await new Promise(r => setTimeout(r, 600)); // Pause 600ms after typing
    };

    // Helper to capture alerts very slowly
    const captureAlert = async (name) => {
        console.log(`Waiting for alert for: ${name}...`);
        await page.waitForSelector('.MuiAlert-message', { timeout: 15000 });
        // Wait 4.5 seconds for the alert to be clearly visible and readable in video
        await new Promise(r => setTimeout(r, 4500)); 
        const screenshotPath = path.join(outDir, `${name}.png`);
        await page.screenshot({ path: screenshotPath });
        console.log(`Saved screenshot: ${screenshotPath}`);
        // Pause 3 seconds after saving screenshot before moving on
        await new Promise(r => setTimeout(r, 3000));
    };

    // Helper to run each step very slowly
    const runStep = async (tabIndex, fillFormFn, screenshotName) => {
        console.log(`\n--- Running Step: ${screenshotName} ---`);
        await page.goto('http://localhost:5173/hqtcsdl/actions');
        await page.waitForSelector('button[role="tab"]');
        await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds after page navigation
        
        const tabs = await page.$$('button[role="tab"]');
        await tabs[tabIndex].click();
        // Wait 3 seconds after selecting tab for clear visual transition
        await new Promise(r => setTimeout(r, 3000));
        
        await fillFormFn();
        
        // Wait 3.5 seconds after filling form before clicking submit
        await new Promise(r => setTimeout(r, 3500));
        await page.click('button[type="submit"]');
        
        await captureAlert(screenshotName);
        // Wait 4 seconds before transitioning to the next step
        await new Promise(r => setTimeout(r, 4000));
    };

    try {
        console.log('Dang nhap...');
        await page.goto('http://localhost:5173/login');
        await page.waitForSelector('input[type="text"]');
        await new Promise(r => setTimeout(r, 2000)); // Wait before starting to type
        
        // Type login details very slowly
        await typeInput('input[type="text"]', 'thuthu01');
        await typeInput('input[type="password"]', 'tt123');
        
        await new Promise(r => setTimeout(r, 2000));
        await page.click('button[type="submit"]');
        // Wait 4 seconds for dashboard redirection and stabilization
        await new Promise(r => setTimeout(r, 4000));

        // 1. B1 - Cap the doc gia - Thanh cong
        await runStep(0, async () => {
            await typeInput('input[name="username"]', 'docgia_test01');
            await typeInput('input[name="password"]', '123456');
            await typeInput('input[name="fullName"]', 'Nguyen Van Kiem Thu');
            await typeInput('input[name="email"]', 'test01@student.edu.vn');
            await typeInput('input[name="phone"]', '0901999888');
            await typeInput('textarea[name="address"]', 'Quan Thu Duc, TP.HCM');
            
            const dateInputs = await page.$$('input[placeholder="DD/MM/YYYY"]');
            if (dateInputs.length > 0) {
                await dateInputs[0].click();
                await new Promise(r => setTimeout(r, 500));
                await page.keyboard.type('15052027', { delay: 100 });
            }
        }, 'B1_Cap_The_Doc_Gia_Success');

        // 2. B1 - Cap the doc gia - Loi Trung Username
        await runStep(0, async () => {
            await typeInput('input[name="username"]', 'docgia_test01'); // Duplicate
            await typeInput('input[name="password"]', '123456');
            await typeInput('input[name="fullName"]', 'Nguyen Van Trung');
            await typeInput('input[name="email"]', 'trung@student.edu.vn');
            await typeInput('input[name="phone"]', '0901999888');
            await typeInput('textarea[name="address"]', 'Quan Thu Duc, TP.HCM');
            
            const dateInputs = await page.$$('input[placeholder="DD/MM/YYYY"]');
            if (dateInputs.length > 0) {
                await dateInputs[0].click();
                await new Promise(r => setTimeout(r, 500));
                await page.keyboard.type('15052027', { delay: 100 });
            }
        }, 'B1_Cap_The_Doc_Gia_Error_Trung');

        // 3. B2 - Lap phieu muon - Thanh cong
        let loanId = 'PM000002'; // Fallback
        await runStep(2, async () => {
            await typeInput('input[name="readerId"]', 'DG000002');
            await typeInput('input[name="employeeId"]', 'NV000001');
            
            const dateInputs = await page.$$('input[placeholder="DD/MM/YYYY"]');
            if (dateInputs.length > 0) {
                await dateInputs[0].click();
                await new Promise(r => setTimeout(r, 500));
                await page.keyboard.type('29052026', { delay: 100 });
            }
        }, 'B2_Lap_Phieu_Muon_Success');

        // Parse actual loan ID
        try {
            const alertText = await page.$eval('.MuiAlert-message', el => el.innerText);
            const match = alertText.match(/Ma phieu:\s*(PM\d+)/);
            if (match) {
                loanId = match[1];
                console.log(`Lấy được mã phiếu mượn mới: ${loanId}`);
            }
        } catch(e) {
            console.log('Dùng PM000002 làm fallback.');
        }

        // 4. B2 - Lap phieu muon - Loi Doc gia khong ton tai
        await runStep(2, async () => {
            await typeInput('input[name="readerId"]', 'DG999999'); // Non-existent
            await typeInput('input[name="employeeId"]', 'NV000001');
            
            const dateInputs = await page.$$('input[placeholder="DD/MM/YYYY"]');
            if (dateInputs.length > 0) {
                await dateInputs[0].click();
                await new Promise(r => setTimeout(r, 500));
                await page.keyboard.type('29052026', { delay: 100 });
            }
        }, 'B2_Lap_Phieu_Muon_Error_Khong_Ton_Tai');

        // 5. B3 - Them sach vao phieu - Thanh cong
        await runStep(3, async () => {
            await typeInput('input[name="loanId"]', loanId);
            await typeInput('input[name="bookId"]', 'S000002');
            await typeInput('input[name="quantity"]', '2');
        }, 'B3_Them_Sach_Success');

        // 6. B3 - Them sach vao phieu - Loi Phieu muon khong ton tai
        await runStep(3, async () => {
            await typeInput('input[name="loanId"]', 'PM999999'); // Non-existent
            await typeInput('input[name="bookId"]', 'S000002');
            await typeInput('input[name="quantity"]', '2');
        }, 'B3_Them_Sach_Error_Phieu_Khong_Ton_Tai');

        // 7. B4 - Nhan tra sach - Thanh cong
        await runStep(4, async () => {
            await typeInput('input[name="loanId"]', 'PM000001');
            await typeInput('input[name="employeeId"]', 'NV000001');
        }, 'B4_Nhan_Tra_Sach_Success');

        // 8. B4 - Nhan tra sach - Loi Phieu muon khong ton tai
        await runStep(4, async () => {
            await typeInput('input[name="loanId"]', 'PM999999'); // Non-existent
            await typeInput('input[name="employeeId"]', 'NV000001');
        }, 'B4_Nhan_Tra_Sach_Error_Phieu_Khong_Ton_Tai');

        // 9. B5 - Nhap sach - Thanh cong
        await runStep(1, async () => {
            await typeInput('input[name="supplierId"]', 'NCC000001');
            await typeInput('input[name="employeeId"]', 'NV000001');
            await typeInput('input[name="bookId"]', 'S000003');
            await typeInput('input[name="quantity"]', '5');
            await typeInput('input[name="price"]', '95000');
        }, 'B5_Nhap_Sach_Success');

        // 10. B5 - Nhap sach - Loi Nha cung cap khong ton tai
        await runStep(1, async () => {
            await typeInput('input[name="supplierId"]', 'NCC999999'); // Non-existent
            await typeInput('input[name="employeeId"]', 'NV000001');
            await typeInput('input[name="bookId"]', 'S000003');
            await typeInput('input[name="quantity"]', '5');
            await typeInput('input[name="price"]', '95000');
        }, 'B5_Nhap_Sach_Error_NCC_Khong_Ton_Tai');

        // 11. B6 - Thanh ly sach - Thanh cong
        await runStep(5, async () => {
            await typeInput('input[name="bookId"]', 'S000003');
            await typeInput('input[name="employeeId"]', 'NV000001');
            await typeInput('input[name="quantity"]', '1');
            await typeInput('textarea[name="reason"]', 'Sach bi rach nat');
        }, 'B6_Thanh_Ly_Sach_Success');

        // 12. B6 - Thanh ly sach - Loi Vuot qua so luong ton kho
        await runStep(5, async () => {
            await typeInput('input[name="bookId"]', 'S000003');
            await typeInput('input[name="employeeId"]', 'NV000001');
            await typeInput('input[name="quantity"]', '999999'); // Too high
            await typeInput('textarea[name="reason"]', 'Thanh ly vuot ton kho');
        }, 'B6_Thanh_Ly_Sach_Error_Qua_So_Luong');

        console.log('Hoan thanh toan bo kich ban.');
    } catch (error) {
        console.error('Loi khi chay:', error);
        await page.screenshot({ path: path.join(outDir, 'ERROR_SCREENSHOT.png') });
    } finally {
        await browser.close();
        try {
            fs.writeFileSync(path.join(outDir, 'test_done.txt'), 'done');
            console.log('Ghi file test_done.txt hoan thanh.');
        } catch (e) {
            console.error('Loi khi ghi file test_done.txt:', e);
        }
    }
}

run();
