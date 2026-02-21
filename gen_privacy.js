const fs = require('fs');
const path = require('path');

const langs = [
    {
        code: 'en',
        title: 'Privacy Policy',
        back: '← Back to Home',
        updated: 'Last Updated: January 8, 2026',
        summaryLabel: 'Summary:',
        summaryText: 'After logging in, your test results will be securely saved so you can review them anytime, compare yourself at different times, and track long-term changes. These records are yours; we will not sell them to anyone, and you can request to delete them at any time. If you have any questions, you can contact us via LINE or Linktree.',
        detailLabel: 'Below is the full text for your reference.',

        h1: '1. What we save for your records',
        p1: 'In order for you to have your own test records and review them long-term after logging in, we will save:',
        li1_1: '<strong>Login Account</strong>: The name, Email, and account identifier you provide when logging in with Google or LINE, used to verify your identity and keep records for you.',
        li1_2: '<strong>Your Test Results</strong>: Your MBTI results and related analysis, for your later review and comparison (if you are not logged in, they will only be saved on your device and will not be uploaded).',
        li1_3: '<strong>Login Time and Method</strong>: Used for your usage records and account security.',
        p1_end: 'You can play the test without logging in, but there will be no cross-device records and long-term tracking functions. The above saving is based on your consent and service needs.',

        h2: '2. Use of these information',
        p2: 'Used only for your own experience and records:',
        li2_1: 'To give you complete test results and analysis, and to review and track your changes long-term',
        li2_2: 'If you have added our LINE, you may receive event or discount notifications (can be canceled at any time)',
        li2_3: 'We may compile statistics anonymously to improve service quality',

        h3: '3. How your records are saved and protected',
        li3_1: 'Logins and accounts are securely managed by <strong>Google Firebase</strong>, and your records are transmitted via HTTPS encryption.',
        li3_2: 'We only keep it for as long as you need to "have a record and review it"; if you delete your account or request deletion, we will delete it within a reasonable period, except as otherwise provided by law.',
        li3_3: 'We will not sell your personal data to anyone.',

        h31: '3-1. Storage Method of Records',
        p31: 'We use cloud services such as Google and LINE to save your login and records. These services may operate outside the country, and we will choose service providers with security standards. Using this service indicates that you understand and agree to this arrangement.',

        h4: '4. Services we use to keep records for you',
        p4: 'Logins and saving of records are completed through the following services, each with its own privacy explanation:',
        li4_1: '<strong>Google Firebase</strong>: For user authentication <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">Privacy Policy</a>',
        li4_2: '<strong>LINE Login</strong>: For LINE account login <a href="https://line.me/en/terms/policy/" target="_blank" rel="noopener">Privacy Policy</a>',
        li4_3: '<strong>Cloudinary</strong>: For image storage and optimization <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener">Privacy Policy</a>',

        h5: '5. Cookies',
        p5: 'We use Cookies to remember your login status, so you don’t have to log in again next time you want to review your records. You can disable them in your browser settings, but you may not be able to use the record and long-term tracking functions.',

        h6: '6. Your Rights',
        p6_1: 'Your records are yours. You can inquire, correct, or delete them at any time, and you can also cancel event notifications. We will respond within the legal time limit. We do not sell your personal data; if the laws in your region grant you other rights, we will also respect them.',
        p6_2: 'To exercise your rights, please contact us via LINE or Linktree.',

        h7: '7. Protection of Minors',
        p7: 'This service is not intended for children under 13. If you are under 18, please use it with the consent of a parent or guardian.',

        h8: '8. Policy Changes',
        p8: 'We may update this page due to regulations or service adjustments, and major changes will be announced on the website. Continued use indicates acceptance of the updated content.',

        h9: '9. Contact Us',
        p9: 'If you have any questions about this policy, please contact us via the following methods:',

        privacyLink: 'Privacy Policy',
        termsLink: 'Terms of Use'
    },
    {
        code: 'ja',
        title: 'プライバシーポリシー',
        back: '← ホームに戻る',
        updated: '最終更新日: 2026年1月8日',
        summaryLabel: '要約:',
        summaryText: 'ログイン後、テスト結果は安全に保存され、いつでも見直したり、異なる時期の自分と比較したり、長期的に記録を辿ることができます。これらの記録はあなた自身のものであり、他人に販売することはありません。いつでも削除を要請できます。ご不明な点がございましたら、LINEまたはLinktreeを通じてお問い合わせください。',
        detailLabel: '以下は完全なテキストです。',

        h1: '1. 記録のために保存するもの',
        p1: 'ログイン後、自分自身のテスト記録を持ち、長期的に見直すことができるように、私たちは以下を保存します：',
        li1_1: '<strong>ログイン用アカウント</strong>: GoogleまたはLINEでログインする際に提供される氏名、Email、アカウント識別子は、本人確認および記録保持のために使用されます。',
        li1_2: '<strong>あなたのテスト結果</strong>: MBTIの診断結果と関連する分析。後で見直したり比較したりするためです（ログインしていない場合、デバイスにのみ保存され、アップロードされません）。',
        li1_3: '<strong>ログイン時間と方法</strong>: 利用履歴とアカウントのセキュリティのために使用されます。',
        p1_end: 'ログインしなくてもテストを受けることはできますが、クロスデバイスの記録や長期的な追跡機能は利用できません。上記の保存は、あなたの同意とサービス向上のために行われます。',

        h2: '2. これらの情報の用途',
        p2: 'あなた自身の体験と記録の目的でのみ使用されます：',
        li2_1: '完全なテスト結果と分析を提供し、いつでも見直して変化を長期的に追跡できるようにするため',
        li2_2: 'LINEを追加している場合、イベントや割引の通知を受け取ることができます（いつでもキャンセル可能）',
        li2_3: 'サービスの質を向上させるために、匿名化された形で統計処理を行う場合があります',

        h3: '3. 記録の保存と保護方法',
        li3_1: 'ログインとアカウントは<strong>Google Firebase</strong>によって安全に管理され、記録の送信はすべてHTTPSで暗号化されます。',
        li3_2: '私たちは、あなたが「記録を持ち、見直せる」必要がある期間のみ保存します。アカウントを削除したり、削除を要請した場合は、法令に別段の定めがない限り、合理的な期間内に削除します。',
        li3_3: 'あなたの個人データを他人に販売することはありません。',

        h31: '3-1. 記録の保管場所',
        p31: '私たちは、GoogleやLINEなどのクラウドサービスを使用して、ログインと記録を保存しています。これらのサービスは海外で運用される可能性がありますが、安全な基準を備えたサービス提供者を選択しています。本サービスを利用することで、この取り決めに理解し同意したことになります。',

        h4: '4. 記録の保存に使用するサービス',
        p4: 'ログインと記録の保存は以下のサービスを介して行われ、それぞれに固有のプライバシー説明があります：',
        li4_1: '<strong>Google Firebase</strong>: ユーザー認証用 <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">プライバシーポリシー</a>',
        li4_2: '<strong>LINE Login</strong>: LINEアカウントログイン用 <a href="https://line.me/ja/terms/policy/" target="_blank" rel="noopener">プライバシーポリシー</a>',
        li4_3: '<strong>Cloudinary</strong>: 画像の保存と最適化用 <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener">プライバシーポリシー</a>',

        h5: '5. クッキー (Cookies)',
        p5: '私たちはクッキーを使用してログイン状態を記憶し、次回ログインせずに自分の記録を確認できるようにしています。ブラウザの設定で無効にすることができますが、記録と長期的な追跡機能を利用できなくなる可能性があります。',

        h6: '6. あなたの権利',
        p6_1: 'あなたの記録はあなたのものです。いつでも照会、修正、削除することができ、イベント通知もキャンセルできます。法令に定められた期間内に対応します。私たちは個人データを販売しません。あなたの居住地域の法律によって他の権利が与えられている場合も、私たちはそれを尊重します。',
        p6_2: '権利を行使する場合は、LINEまたはLinktreeを通じてご連絡ください。',

        h7: '7. 未成年者の保護',
        p7: '本サービスは13歳未満の子供を対象としていません。18歳未満の場合は、保護者または後見人の同意のもとで利用してください。',

        h8: '8. ポリシーの変更',
        p8: '法令やサービスの調整により、このページを更新することがあり、重要な変更はウェブサイトでお知らせします。継続して使用することで、更新された内容に同意したものとみなされます。',

        h9: '9. お問い合わせ',
        p9: 'このポリシーに関してご質問がある場合は、以下の方法でご連絡ください：',

        privacyLink: 'プライバシーポリシー',
        termsLink: '利用規約'
    },
    {
        code: 'ko',
        title: '개인정보 보호정책',
        back: '← 홈으로 돌아가기',
        updated: '최종 업데이트: 2026년 1월 8일',
        summaryLabel: '요약:',
        summaryText: '로그인 후, 귀하의 테스트 결과는 안전하게 저장되어 언제든지 검토하고, 다른 시기의 자신과 비교하며, 장기적인 변화를 추적할 수 있습니다. 이 기록은 귀하의 소유이며 타인에게 판매하지 않으며, 언제든지 삭제를 요청할 수 있습니다. 질문이 있으시면 LINE이나 Linktree를 통해 문의해 주십시오.',
        detailLabel: '아래는 참조용 전체 텍스트입니다.',

        h1: '1. 기록을 위해 어떤 정보를 저장합니까?',
        p1: '로그인 후 자신의 테스트 기록을 유지하고 장기적으로 검토할 수 있도록 당사는 다음을 저장합니다:',
        li1_1: '<strong>로그인 계정</strong>: Google 또는 LINE으로 로그인할 때 제공되는 이름, Email 및 계정 식별자는 본인을 확인하고 기록을 유지하는 데 사용됩니다.',
        li1_2: '<strong>귀하의 테스트 결과</strong>: 귀하의 MBTI 결과 및 관련 분석은 나중에 검토하고 비교할 수 있도록 저장됩니다 (로그인하지 않은 경우 장치에만 저장되고 업로드되지 않습니다).',
        li1_3: '<strong>로그인 시간 및 방법</strong>: 사용 내역 및 계정 보안을 위해 사용됩니다.',
        p1_end: '로그인하지 않고도 테스트를 이용할 수 있지만 기기 간 기록 및 장기 추적 기능은 없습니다. 위 사항의 저장은 귀하의 동의 및 서비스 요구 사항에 기반합니다.',

        h2: '2. 정보의 용도',
        p2: '사용자의 경험 및 기록을 위해서만 사용됩니다:',
        li2_1: '완전한 테스트 결과와 분석을 제공하고 언제든지 검토하고 장기적으로 추적할 수 있도록 함',
        li2_2: '저희 LINE을 추가하신 경우, 이벤트 또는 할인 알림을 받을 수 있습니다 (언제든지 취소 가능)',
        li2_3: '서비스 품질 개선을 위해 익명으로 통계를 작성할 수 있습니다',

        h3: '3. 기록의 저장 및 보호 방법',
        li3_1: '로그인 및 계정은 <strong>Google Firebase</strong>에 의해 안전하게 관리되며 귀하의 기록은 HTTPS 암호화를 통해 전송됩니다.',
        li3_2: '당사는 귀하가 "기록을 유지하고 검토할" 필요가 있는 기간 동안만 보관합니다. 계정을 삭제하거나 삭제를 요청하는 경우, 법률에 달리 규정되지 않는 한 합리적인 기간 내에 삭제됩니다.',
        li3_3: '당사는 귀하의 개인 데이터를 타인에게 판매하지 않습니다.',

        h31: '3-1. 기록의 보관 위치',
        p31: '당사는 Google, LINE 등의 클라우드 서비스를 사용하여 로그인 및 기록을 저장합니다. 이러한 서비스는 해외에서 운영될 수 있으며, 당사는 안전 기준을 갖춘 서비스 제공자를 선택합니다. 이 서비스를 사용하면 이 사항을 이해하고 동의하는 것으로 간주됩니다.',

        h4: '4. 기록을 보관하기 위해 사용하는 서비스',
        p4: '로그인 및 기록의 저장은 다음 서비스를 통해 수행되며 각각 고유한 개인 정보 보호 정책이 있습니다:',
        li4_1: '<strong>Google Firebase</strong>: 사용자 인증용 <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener">개인정보 보호정책</a>',
        li4_2: '<strong>LINE Login</strong>: LINE 계정 로그인용 <a href="https://line.me/ko/terms/policy/" target="_blank" rel="noopener">개인정보 보호정책</a>',
        li4_3: '<strong>Cloudinary</strong>: 이미지 저장 및 최적화용 <a href="https://cloudinary.com/privacy" target="_blank" rel="noopener">개인정보 보호정책</a>',

        h5: '5. 쿠키 (Cookies)',
        p5: '당사는 귀하의 로그인 상태를 기억하기 위해 쿠키를 사용하므로 다음에 다시 로그인하지 않고도 자신의 기록을 볼 수 있습니다. 브라우저 설정에서 비활성화할 수 있지만 기록 및 장기 추적 기능을 사용하지 못할 수 있습니다.',

        h6: '6. 귀하의 권리',
        p6_1: '귀하의 기록은 귀하의 소유입니다. 언제든지 조회, 수정 또는 삭제할 수 있으며 이벤트 알림도 취소할 수 있습니다. 당사는 법정 기한 내에 답변을 드릴 것입니다. 당사는 귀하의 개인 데이터를 판매하지 않습니다. 귀하가 거주하는 지역의 법률이 다른 권리를 부여하는 경우 그 또한 존중합니다.',
        p6_2: '권리를 행사하려면 LINE 또는 Linktree를 통해 문의하십시오.',

        h7: '7. 미성년자 보호',
        p7: '이 서비스는 13세 미만의 어린이를 대상으로 하지 않습니다. 18세 미만인 경우 부모 또는 보호자의 동의하에 사용하십시오.',

        h8: '8. 정책 변경',
        p8: '규정이나 서비스 조정에 따라 이 페이지를 업데이트할 수 있으며 중요한 변경 사항은 웹사이트에 공지됩니다. 계속 사용하면 업데이트된 내용에 동의하는 것으로 간주됩니다.',

        h9: '9. 문의하기',
        p9: '이 정책에 관해 질문이 있으시면 다음 방법을 통해 문의하십시오:',

        privacyLink: '개인정보 보호정책',
        termsLink: '이용 약관'
    }
];

const templatePath = path.join(__dirname, 'public/privacy.html');
const templateStr = fs.readFileSync(templatePath, 'utf8');

langs.forEach(lang => {
    let output = templateStr
        .replace('<title>隱私權政策', `<title>${lang.title}`)
        .replace('<!DOCTYPE html>\n<html lang="zh-TW">', `<!DOCTYPE html>\n<html lang="${lang.code}">`)
        .replace('← 返回首頁', lang.back)
        .replace('>隱私權政策</h1>', `>${lang.title}</h1>`)
        .replace('最後更新日期：2026 年 1 月 8 日', lang.updated)
        .replace('<strong>簡單說：</strong>', `<strong>${lang.summaryLabel}</strong>`)
        .replace('登入後，您的測驗結果會安全保存，方便您隨時回看、對比不同時期的自己，做長期追蹤。這些記錄是您的，我們不會賣給任何人，您也可以隨時要求刪除。若有疑問，透過 LINE 或 Linktree 找我們即可。', lang.summaryText)
        .replace('以下為完整條文，供您查閱。', lang.detailLabel)

        .replace('1. 為了您的記錄，我們會保存什麼', lang.h1)
        .replace('為了讓您登入後能擁有自己的測驗記錄並長期回看，我們會保存：', lang.p1)
        .replace('<strong>登入用帳號</strong>：您用 Google 或 LINE 登入時提供的姓名、Email、帳號識別，用來辨識是您本人並為您保留記錄。', lang.li1_1)
        .replace('<strong>您的測驗結果</strong>：您的 MBTI 結果與相關分析，供您之後回看與對比（未登入時若僅存於您裝置，則不會上傳）。', lang.li1_2)
        .replace('<strong>登入時間與方式</strong>：用於您的使用紀錄與帳號安全。', lang.li1_3)
        .replace('不登入也可以玩測驗，但就不會有跨裝置的記錄與長期追蹤功能。上述保存係基於您的同意與服務所需。', lang.p1_end)

        .replace('2. 這些資訊的用途', lang.h2)
        .replace('僅用於您自己的體驗與記錄：', lang.p2)
        .replace('讓您有完整的測驗結果與分析，並可隨時回看、長期追蹤自己的變化', lang.li2_1)
        .replace('若您有加我們 LINE，可收到活動或優惠通知（可隨時取消）', lang.li2_2)
        .replace('我們可能以匿名方式統計，用來改善服務品質', lang.li2_3)

        .replace('3. 您的記錄如何保存與保護', lang.h3)
        .replace('登入與帳號由 <strong>Google Firebase</strong> 安全管理，您的記錄傳輸均透過 HTTPS 加密。', lang.li3_1)
        .replace('我們僅在您需要「有記錄、可回看」的期間內保留；若您刪除帳號或要求刪除，我們會於合理期限內刪除，法律另有規定者除外。', lang.li3_2)
        .replace('我們不會將您的個人資料出售給任何人。', lang.li3_3)

        .replace('3-1. 記錄的存放方式', lang.h31)
        .replace('我們使用 Google、LINE 等雲端服務來為您保存登入與記錄，這些服務可能於境外運作，我們會選擇具安全標準之服務商。使用本服務即表示您了解並同意此安排。', lang.p31)

        .replace('4. 我們用來為您保存記錄的服務', lang.h4)
        .replace('登入與記錄的保存會透過以下服務完成，它們各有自己的隱私說明：', lang.p4)
        .replace(/<strong>Google Firebase<\/strong>：用於使用者認證\s*<a href="https:\/\/firebase.google.com\/support\/privacy" target="_blank" rel="noopener">隱私權政策<\/a>/, lang.li4_1)
        .replace(/<strong>LINE Login<\/strong>：用於 LINE 帳號登入\s*<a href="https:\/\/line.me\/zh-hant\/terms\/policy\/" target="_blank" rel="noopener">隱私權政策<\/a>/, lang.li4_2)
        .replace(/<strong>Cloudinary<\/strong>：用於圖片儲存與優化\s*<a href="https:\/\/cloudinary.com\/privacy" target="_blank" rel="noopener">隱私權政策<\/a>/, lang.li4_3)

        .replace('5. Cookies', lang.h5)
        .replace('我們用 Cookies 來記住您的登入狀態，讓您下次不用重複登入即可看到自己的記錄。您可於瀏覽器設定中停用，但可能無法使用記錄與長期追蹤功能。', lang.p5)

        .replace('6. 您的權利', lang.h6)
        .replace('您的記錄是您的。您隨時可以查詢、更正或刪除，也可以取消活動通知。我們會在法律規定期限內回覆。我們不會出售您的個資；若您所在地區法律賦予其他權利，我們也會尊重。', lang.p6_1)
        .replace('如需行使權利，請透過 LINE 或 Linktree 聯繫我們。', lang.p6_2)

        .replace('7. 未成年人保護', lang.h7)
        .replace('本服務不針對 13 歲以下兒童。如果您未滿 18 歲，請在家長或監護人同意下使用。', lang.p7)

        .replace('8. 政策變更', lang.h8)
        .replace('我們可能因法規或服務調整而更新本頁，重大變更會於網站公告。繼續使用即視為接受更新後內容。', lang.p8)

        .replace('9. 聯絡我們', lang.h9)
        .replace('如對本政策有任何疑問，請透過以下方式聯繫：', lang.p9)

        .replace(' href="/privacy.html">隱私權政策</a>', ` href="/privacy-${lang.code}.html">${lang.privacyLink}</a>`)
        .replace(' href="/terms.html">使用者條款</a>', ` href="/terms-${lang.code}.html">${lang.termsLink}</a>`);

    fs.writeFileSync(path.join(__dirname, `public/privacy-${lang.code}.html`), output);
    console.log(`Generated privacy-${lang.code}.html`);
});
