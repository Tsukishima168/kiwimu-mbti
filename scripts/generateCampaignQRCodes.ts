import QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

interface CampaignParams {
    source: 'dm' | 'poster' | 'social' | 'line' | 'partner';
    campaign: string;
    medium: string;
    content: string;
    month?: 'feb' | 'mar' | 'apr';
    location?: string;
}

async function generateCampaignQR(
    params: CampaignParams,
    filename: string
): Promise<string> {
    // 構建 URL
    const baseUrl = 'https://kiwimu.com';
    const urlParams = new URLSearchParams({
        source: params.source,
        campaign: params.campaign,
        medium: params.medium,
        content: params.content,
        ...(params.month && { month: params.month }),
        ...(params.location && { location: params.location })
    });

    const url = `${baseUrl}?${urlParams.toString()}`;

    // 生成 QR Code
    await QRCode.toFile(filename, url, {
        width: 500,
        margin: 2,
        errorCorrectionLevel: 'H', // 高容錯率
        color: {
            dark: '#2C2C2C',  // Moon Shadow
            light: '#F5F1E8'  // Moon Cream
        }
    });

    console.log(`✅ Generated: ${path.basename(filename)}`);
    console.log(`   URL: ${url}`);

    return url;
}

async function generateAllQRCodes() {
    const outputDir = './public/qr-codes/spring2026';

    // 確保輸出目錄存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('🎯 開始生成春季活動 QR Codes...\n');

    const qrCodes: Array<{ name: string; url: string; purpose: string }> = [];

    // ━━━ 2 月份 QR Codes ━━━
    console.log('📅 2月份 QR Codes:');

    qrCodes.push({
        name: '01_dm_v1_feb.png',
        url: await generateCampaignQR(
            {
                source: 'dm',
                campaign: 'spring2026',
                medium: 'card',
                content: 'v1_cny',
                month: 'feb'
            },
            path.join(outputDir, '01_dm_v1_feb.png')
        ),
        purpose: 'DM Card V1 - 春節啟航卡（2,000張）'
    });

    qrCodes.push({
        name: '02_poster_main.png',
        url: await generateCampaignQR(
            {
                source: 'poster',
                campaign: 'spring2026',
                medium: 'door',
                content: 'main',
                location: 'store01'
            },
            path.join(outputDir, '02_poster_main.png')
        ),
        purpose: '門口海報 - 主視覺（常駐）'
    });

    qrCodes.push({
        name: '03_poster_cny_feb.png',
        url: await generateCampaignQR(
            {
                source: 'poster',
                campaign: 'spring2026',
                medium: 'door',
                content: 'cny',
                month: 'feb'
            },
            path.join(outputDir, '03_poster_cny_feb.png')
        ),
        purpose: '門口海報 - 新春版（2月）'
    });

    qrCodes.push({
        name: '04_dm_v1_cafe.png',
        url: await generateCampaignQR(
            {
                source: 'dm',
                campaign: 'spring2026',
                medium: 'card',
                content: 'v1_cny',
                location: 'partner_cafe'
            },
            path.join(outputDir, '04_dm_v1_cafe.png')
        ),
        purpose: '合作咖啡廳 DM（600張）'
    });

    qrCodes.push({
        name: '05_dm_v1_community.png',
        url: await generateCampaignQR(
            {
                source: 'dm',
                campaign: 'spring2026',
                medium: 'card',
                content: 'v1_cny',
                location: 'community'
            },
            path.join(outputDir, '05_dm_v1_community.png')
        ),
        purpose: '社區信箱 DM（400張）'
    });

    qrCodes.push({
        name: '06_dm_v1_street.png',
        url: await generateCampaignQR(
            {
                source: 'dm',
                campaign: 'spring2026',
                medium: 'card',
                content: 'v1_cny',
                location: 'street'
            },
            path.join(outputDir, '06_dm_v1_street.png')
        ),
        purpose: '街頭發放 DM（200張）'
    });

    // ━━━ 3 月份 QR Codes ━━━
    console.log('\n📅 3月份 QR Codes:');

    qrCodes.push({
        name: '07_dm_v2_mar.png',
        url: await generateCampaignQR(
            {
                source: 'dm',
                campaign: 'spring2026',
                medium: 'card',
                content: 'v2_spring',
                month: 'mar'
            },
            path.join(outputDir, '07_dm_v2_mar.png')
        ),
        purpose: 'DM Card V2 - 春季探索卡（2,000張）'
    });

    qrCodes.push({
        name: '08_poster_spring_mar.png',
        url: await generateCampaignQR(
            {
                source: 'poster',
                campaign: 'spring2026',
                medium: 'door',
                content: 'spring',
                month: 'mar'
            },
            path.join(outputDir, '08_poster_spring_mar.png')
        ),
        purpose: '門口海報 - 春季版（3月）'
    });

    qrCodes.push({
        name: '09_poster_discord_mar.png',
        url: await generateCampaignQR(
            {
                source: 'poster',
                campaign: 'spring2026',
                medium: 'door',
                content: 'discord',
                month: 'mar'
            },
            path.join(outputDir, '09_poster_discord_mar.png')
        ),
        purpose: '門口海報 - Discord 邀請（3月）'
    });

    qrCodes.push({
        name: '10_dm_v2_university.png',
        url: await generateCampaignQR(
            {
                source: 'dm',
                campaign: 'spring2026',
                medium: 'card',
                content: 'v2_spring',
                location: 'university'
            },
            path.join(outputDir, '10_dm_v2_university.png')
        ),
        purpose: '大學校園 DM（600張）'
    });

    qrCodes.push({
        name: '11_dm_v2_office.png',
        url: await generateCampaignQR(
            {
                source: 'dm',
                campaign: 'spring2026',
                medium: 'card',
                content: 'v2_spring',
                location: 'office'
            },
            path.join(outputDir, '11_dm_v2_office.png')
        ),
        purpose: '辦公大樓 DM（400張）'
    });

    // ━━━ 4 月份 QR Codes ━━━
    console.log('\n📅 4月份 QR Codes:');

    qrCodes.push({
        name: '12_dm_v3_apr.png',
        url: await generateCampaignQR(
            {
                source: 'dm',
                campaign: 'spring2026',
                medium: 'card',
                content: 'v3_vip',
                month: 'apr'
            },
            path.join(outputDir, '12_dm_v3_apr.png')
        ),
        purpose: 'DM Card V3 - VIP 招募卡（1,000張）'
    });

    qrCodes.push({
        name: '13_poster_vip_apr.png',
        url: await generateCampaignQR(
            {
                source: 'poster',
                campaign: 'spring2026',
                medium: 'door',
                content: 'vip',
                month: 'apr'
            },
            path.join(outputDir, '13_poster_vip_apr.png')
        ),
        purpose: '門口海報 - VIP版（4月）'
    });

    qrCodes.push({
        name: '14_instagram_story.png',
        url: await generateCampaignQR(
            {
                source: 'social',
                campaign: 'spring2026',
                medium: 'instagram',
                content: 'story'
            },
            path.join(outputDir, '14_instagram_story.png')
        ),
        purpose: 'Instagram 限時動態'
    });

    qrCodes.push({
        name: '15_line_broadcast.png',
        url: await generateCampaignQR(
            {
                source: 'line',
                campaign: 'spring2026',
                medium: 'broadcast',
                month: 'apr'
            },
            path.join(outputDir, '15_line_broadcast.png')
        ),
        purpose: 'LINE 推播連結'
    });

    // 生成 README
    const readmeContent = `# KIWIMU 春季活動 QR Codes

生成日期：${new Date().toISOString()}

## QR Code 清單

${qrCodes.map((qr, index) => `
### ${index + 1}. ${qr.purpose}
- **檔案：** ${qr.name}
- **網址：** ${qr.url}
`).join('\n')}

## 使用說明

1. 所有 QR Code 已生成於此資料夾
2. 解析度：500x500 px（可放大至 5cm x 5cm 印刷）
3. 容錯率：H（30%，適合印刷）
4. 顏色：Moon Shadow (#2C2C2C) / Moon Cream (#F5F1E8)

## 印刷注意事項

- ✅ 最小尺寸：2cm x 2cm
- ✅ 建議尺寸：3-5cm x 3-5cm
- ✅ 周圍留白：至少 0.5cm
- ✅ 印刷解析度：300 DPI
- ✅ 掃描測試：印刷後務必測試

## 追蹤數據

所有掃碼數據將記錄在 Google Analytics 4
查看路徑：Reports → Engagement → Events → campaign_entry
`;

    fs.writeFileSync(
        path.join(outputDir, 'README.md'),
        readmeContent
    );

    console.log('\n✅ 所有 QR Codes 生成完成！');
    console.log(`📁 檔案位置：${outputDir}`);
    console.log(`📄 說明文件：${path.join(outputDir, 'README.md')}`);
}

// 執行
generateAllQRCodes().catch(console.error);
