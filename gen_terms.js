const fs = require('fs');
const path = require('path');

const langs = [
    {
        code: 'en',
        title: 'Terms of Use',
        back: '← Back to Home',
        updated: 'Last Updated: January 8, 2026',
        summaryLabel: 'Summary:',
        summaryText: 'The test is for entertainment and self-exploration only, not professional advice. Please use it reasonably and do not abuse it; we will try our best to maintain service stability. If there are any disputes, please contact us first.',
        detailLabel: 'Below is the full text for your reference.',
        h1: '1. Service Description',
        p1: 'KIWIMU MBTI Lab provides a free MBTI personality test service. The test results are for reference only and should not be used as professional psychological counseling or medical diagnosis.',
        h2: '2. User Responsibilities',
        li2_1: 'You must provide true and accurate information',
        li2_2: 'Your account is for personal use only and cannot be transferred or shared',
        li2_3: 'Any form of abuse, malicious attack, or reverse engineering is prohibited',
        h3: '3. Intellectual Property Rights',
        p3: 'All content on this site (including but not limited to text, images, designs) is protected by copyright and may not be copied or used for commercial purposes without authorization.',
        h4: '4. Disclaimer',
        li4_1: 'Test results are for entertainment and self-exploration only and do not constitute professional psychological, medical, or career advice',
        li4_2: 'We are not responsible for any losses arising from the use of this service; the service may be temporarily interrupted for maintenance or other reasons',
        h41: '4-1. Consumer Protection',
        p41: 'This service is currently provided for free. If there are paid items, they will be specified separately and comply with relevant regulations. These terms do not exclude rights you may claim under the law.',
        h5: '5. Termination of Service',
        p5: 'We reserve the right to terminate or suspend your account or service at any time, especially in case of violation of the Terms of Use.',
        h6: '6. Changes to Terms',
        p6: 'We reserve the right to modify these terms at any time. Upon changes, the "Last Updated" date on this page will be updated, and major changes will be announced on the website or within the service. Your continued use of the service after such changes constitutes acceptance of the new terms. If you disagree, please stop using the service and you may request deletion of your account.',
        h7: '7. Governing Law and Dispute Resolution',
        p7: 'These terms are governed by the laws of the Republic of China (Taiwan), with the Taiwan Taipei District Court as the court of first instance jurisdiction. We encourage resolving disputes through communication or mediation first.',
        h8: '8. Miscellaneous',
        p8_1: 'If any provision is deemed invalid, it does not affect the remaining provisions. These terms and the ',
        p8_link: 'Privacy Policy',
        p8_2: ' constitute the entire agreement between you and us regarding this service. Using this service indicates your agreement to these terms and the privacy policy.',
        privacyLink: 'Privacy Policy',
        termsLink: 'Terms of Use'
    },
    {
        code: 'ja',
        title: '利用規約',
        back: '← ホームに戻る',
        updated: '最終更新日: 2026年1月8日',
        summaryLabel: '要約:',
        summaryText: 'このテストはエンターテインメントと自己探求のみを目的としており、専門的なアドバイスではありません。合理的に利用し、乱用しないでください。私たちはサービスの安定性を維持するために最善を尽くします。何か問題があれば、まず私たちに連絡してください。',
        detailLabel: '以下は完全なテキストです。',
        h1: '1. サービス内容',
        p1: 'KIWIMU MBTI Labは無料のMBTI性格テストサービスを提供しています。テスト結果は参考用であり、専門的な心理カウンセリングや医療診断として使用しないでください。',
        h2: '2. ユーザーの責任',
        li2_1: '真実かつ正確な情報を提供する必要があります',
        li2_2: 'アカウントは個人利用のみで、譲渡や共有はできません',
        li2_3: 'いかなる形式の乱用、悪意のある攻撃、リバースエンジニアリングも禁止されています',
        h3: '3. 知的財産権',
        p3: '本サイトのすべてのコンテンツ（テキスト、画像、デザインを含むがこれに限らない）は著作権で保護されており、許可なく複製や商業利用することはできません。',
        h4: '4. 免責事項',
        li4_1: 'テスト結果はエンターテインメントと自己探求のみを目的としており、専門的な心理、医療、職業アドバイスを構成するものではありません',
        li4_2: '本サービスの利用によって生じたいかなる損失についても責任を負いません。メンテナンス等によりサービスが一時中断することがあります',
        h41: '4-1. 消費者保護',
        p41: '本サービスは現在無料で提供されています。有料のアイテムがある場合は別途説明し、関連法規を遵守します。本規約は、法律に基づいて主張できる権利を排除するものではありません。',
        h5: '5. サービスの終了',
        p5: '私たちは、特に利用規約の違反があった場合、いつでもアカウントやサービスを終了または一時停止する権利を留保します。',
        h6: '6. 規約の変更',
        p6: '私たちはいつでも本規約を変更する権利を留保します。変更後、本ページの「最終更新日」が更新され、重要な変更はウェブサイトまたはサービス内で告知されます。変更後も引き続きサービスを利用することで、新しい規約に同意したものとみなされます。同意しない場合は、利用を停止し、アカウントの削除を求めることができます。',
        h7: '7. 準拠法および紛争解決',
        p7: '本規約は中華民国（台湾）の法律に準拠し、台湾台北地方法院を第一審の管轄裁判所とします。まずは対話や調停を通じて紛争を解決することをお勧めします。',
        h8: '8. その他',
        p8_1: 'いずれかの条項が無効とされた場合でも、他の条項には影響しません。本規約および',
        p8_link: 'プライバシーポリシー',
        p8_2: 'は、本サービスに関するお客様と私たちの間の完全な合意を構成します。本サービスを利用することで、本規約およびプライバシーポリシーに同意したものとみなされます。',
        privacyLink: 'プライバシーポリシー',
        termsLink: '利用規約'
    },
    {
        code: 'ko',
        title: '이용 약관',
        back: '← 홈으로 돌아가기',
        updated: '최종 업데이트: 2026년 1월 8일',
        summaryLabel: '요약:',
        summaryText: '본 테스트는 오락 및 자아 탐색 목적으로만 제공되며 전문가의 조언이 아닙니다. 합리적으로 이용하시고 남용하지 마십시오. 서비스 안정을 위해 최선을 다하겠습니다. 분쟁이 있을 경우 먼저 저희에게 연락해 주십시오.',
        detailLabel: '아래는 참조용 전체 텍스트입니다.',
        h1: '1. 서비스 내용',
        p1: 'KIWIMU MBTI Lab은 무료 MBTI 성격 테스트 서비스를 제공합니다. 테스트 결과는 참고용이며 전문적인 심리 상담이나 의료 진단으로 사용해서는 안 됩니다.',
        h2: '2. 사용자의 책임',
        li2_1: '진실되고 정확한 정보를 제공해야 합니다',
        li2_2: '계정은 개인 사용만 가능하며 양도하거나 공유할 수 없습니다',
        li2_3: '어떠한 형태의 남용, 악의적인 공격 또는 리버스 엔지니어링도 금지됩니다',
        h3: '3. 지적 재산권',
        p3: '본 사이트의 모든 콘텐츠(텍스트, 이미지, 디자인 등 포함)는 저작권의 보호를 받으며 허가 없이 복제하거나 상업적으로 사용할 수 없습니다.',
        h4: '4. 면책 조항',
        li4_1: '테스트 결과는 오락 및 자아 탐색 목적으로만 제공되며 전문적인 심리, 의료 또는 경력 조언을 구성하지 않습니다',
        li4_2: '본 서비스 이용으로 인해 발생하는 어떠한 손해에 대해서도 책임을 지지 않습니다. 유지 보수 등의 이유로 서비스가 일시 중단될 수 있습니다',
        h41: '4-1. 소비자 보호',
        p41: '본 서비스는 현재 무료로 제공됩니다. 유료 항목이 있는 경우 별도로 설명하고 관련 법규를 준수합니다. 본 약관은 법률에 따라 주장할 수 있는 권리를 배제하지 않습니다.',
        h5: '5. 서비스 종료',
        p5: '당사는 특히 이용 약관을 위반하는 경우 언제든지 계정 또는 서비스를 종료하거나 일시 중지할 권리를 보유합니다.',
        h6: '6. 약관 변경',
        p6: '당사는 언제든지 본 약관을 수정할 권리를 보유합니다. 변경 시 본 페이지의 "최종 업데이트"가 업데이트되며 중요한 변경 사항은 웹사이트 또는 서비스 내에 공지됩니다. 변경 후 계속 서비스를 이용하면 새로운 약관에 동의한 것으로 간주됩니다. 동의하지 않는 경우 서비스 이용을 중지하고 계정 삭제를 요청할 수 있습니다.',
        h7: '7. 준거법 및 분쟁 해결',
        p7: '본 약관은 중화민국(대만) 법률의 적용을 받으며 대만 타이베이 지방 법원을 제1심 관할 법원으로 합니다. 먼저 대화나 조정을 통해 분쟁을 해결할 것을 권장합니다.',
        h8: '8. 기타',
        p8_1: '일부 조항이 무효로 간주되더라도 나머지 조항에는 영향을 미치지 않습니다. 본 약관 및 ',
        p8_link: '개인정보 보호정책',
        p8_2: '은 본 서비스에 관한 귀하와 당사 간의 전체 합의를 구성합니다. 본 서비스를 이용하면 본 약관 및 개인정보 보호정책에 동의한 것으로 간주됩니다.',
        privacyLink: '개인정보 보호정책',
        termsLink: '이용 약관'
    }
];

const templatePath = path.join(__dirname, 'public/terms.html');
const templateStr = fs.readFileSync(templatePath, 'utf8');

langs.forEach(lang => {
    let output = templateStr
        .replace('<title>使用者條款', `<title>${lang.title}`)
        .replace('<!DOCTYPE html>\n<html lang="zh-TW">', `<!DOCTYPE html>\n<html lang="${lang.code}">`)
        .replace('← 返回首頁', lang.back)
        .replace('>使用者條款</h1>', `>${lang.title}</h1>`)
        .replace('最後更新日期：2026 年 1 月 8 日', lang.updated)
        .replace('<strong>簡單說：</strong>', `<strong>${lang.summaryLabel}</strong>`)
        .replace('測驗僅供娛樂與自我探索，不能當成專業建議。請合理使用、不要濫用，我們會盡力維持服務穩定；若有爭議，歡迎先跟我們溝通。', lang.summaryText)
        .replace('以下為完整條文，供您查閱。', lang.detailLabel)
        .replace('1. 服務說明', lang.h1)
        .replace('KIWIMU MBTI Lab 提供免費的 MBTI 人格測驗服務。測驗結果僅供參考，不應作為專業心理諮詢或醫療診斷之用。', lang.p1)
        .replace('2. 使用者責任', lang.h2)
        .replace('您必須提供真實且正確的資訊', lang.li2_1)
        .replace('您的帳號僅供個人使用，不得轉讓或分享', lang.li2_2)
        .replace('禁止任何形式的濫用、惡意攻擊或逆向工程', lang.li2_3)
        .replace('3. 智慧財產權', lang.h3)
        .replace('本網站的所有內容（包括但不限於文字、圖片、設計）均受著作權保護，未經授權不得複製或商業使用。', lang.p3)
        .replace('4. 免責聲明', lang.h4)
        .replace('測驗結果僅供娛樂與自我探索，不構成專業心理、醫療或職涯建議', lang.li4_1)
        .replace('我們不對因使用本服務所產生之損失負責；服務可能因維護等原因暫時中斷', lang.li4_2)
        .replace('4-1. 消費者保護', lang.h41)
        .replace('本服務目前為免費提供。若有付費項目將另行說明並遵守相關法規。本條款不排除您依法得主張之權利。', lang.p41)
        .replace('5. 終止服務', lang.h5)
        .replace('我們保留隨時終止或暫停您的帳號或服務的權利，尤其在違反使用條款的情況下。', lang.p5)
        .replace('6. 條款變更', lang.h6)
        .replace('我們保留隨時修改本條款之權利。變更後將於本頁更新「最後更新日期」，重大變更會於網站或服務內公告。您於變更後繼續使用本服務，即視為接受新條款。若您不同意，請停止使用並得請求刪除帳號。', lang.p6)
        .replace('7. 法律管轄與爭議解決', lang.h7)
        .replace('本條款以中華民國法律為準，爭議以台灣台北地方法院為第一審管轄法院。我們鼓勵先透過溝通或調解解決。', lang.p7)
        .replace('8. 其他', lang.h8)
        .replace('若某條文被認定無效，不影響其餘條文。本條款與<a href="/privacy.html">隱私權政策</a>構成您與我們就本服務之完整約定。使用本服務即表示您同意本條款及隱私權政策。',
            `${lang.p8_1}<a href="/privacy-${lang.code}.html">${lang.p8_link}</a>${lang.p8_2}`)
        .replace(' href="/privacy.html">隱私權政策</a>', ` href="/privacy-${lang.code}.html">${lang.privacyLink}</a>`)
        .replace(' href="/terms.html">使用者條款</a>', ` href="/terms-${lang.code}.html">${lang.termsLink}</a>`);

    fs.writeFileSync(path.join(__dirname, `public/terms-${lang.code}.html`), output);
    console.log(`Generated terms-${lang.code}.html`);
});
