import type { QuizType } from './types';

// ─── Japan (ja-JP) ────────────────────────────────────────────────────────────

export const quizAJP: QuizType = {
  id: 'A',
  title: 'デジタル疲労サバイバー診断',
  description: '5問でわかる2026年のデジタル生存タイプ。あなたはどんな社会動物？',
  questions: [
    {
      id: 'q1',
      dimension: 'E/I',
      text: '金曜の深夜、魂が抜け出るほど疲れているのに、布団の中でスマホを開いたら最初にやることは？',
      options: [
        { text: 'X(旧Twitter)・インスタ・LINEを爆速スクロール。「みんな今何してる？」と外の世界と繋がることで不思議とチャージされる。', value: 'E', visual: 'Kiwimu が膨らんで全SNSを同時接続しようとする' },
        { text: '鍵垢か見る専アカに切り替え、無音で推し動画をぼーっと流し見。今夜は「活きた人間」と関わりたくない。', value: 'I', visual: 'Kiwimu がそっと鍵垢の暗闇の奥に縮んでいく' },
      ],
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: 'SNSで万単位でRTされた炎上投稿を発見。あなたの脳が最初にやることは？',
      options: [
        { text: '即コメ欄へ。時系列・証拠・誰が悪いかを確認してから判断したいタイプ。「ファクトを整理してから動く」が信条。', value: 'S', visual: 'Kiwimu がコメント欄を精密な抹刀でフラットに整理する' },
        { text: '事件の細部より「なぜ炎上したか」「社会が何を求めているか」を考え始める。気づいたらメモ帳に思考が広がっている。', value: 'N', visual: 'Kiwimu が雲になって炎上の上空へ飛んでいく' },
      ],
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: '友人がグループLINEで「また上司にやらかされた😭」と号泣中。まず打つ文章は？',
      options: [
        { text: '「スクショ保存して。事実関係を整理しよう。次の対応策を一緒に考えよう。」解決策を先に提示するタイプ。', value: 'T', visual: 'Kiwimu が塩をひとつまみ加えて冷静に固まる' },
        { text: '「それはしんどすぎる😭抱きしめたい。今から電話できる？」まず感情を受け止めるのが最優先。', value: 'F', visual: 'Kiwimu が砂糖のように甘く溶けて友達を包む' },
      ],
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: 'スマホのSNS通知バッジ（赤い数字）の扱い方、正直に言うと？',
      options: [
        { text: '未読が残っていると落ち着かない！定期的に全消しして「デジタル整頓完了」の達成感を得るタイプ。', value: 'J', visual: 'Kiwimu が完璧な星型に絞り出され、バッジゼロに満足する' },
        { text: '通知バッジ？∞でも別に。「いつか見る」の精神で放置。必要な情報は向こうからリマインドしてくる。', value: 'P', visual: 'Kiwimu が机に広がってそのまま固まってしまう' },
      ],
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: '渾身のネタ投稿を出したのに30分経っても反応ゼロ。その後どうなる？',
      options: [
        { text: '「まあいっか、アルゴリズムの機嫌が悪かっただけ。」スマホを置いてラーメンでも食べに行く。', value: 'A', visual: 'Kiwimu がそのままぷるっと揺れて平然としている' },
        { text: '「滑った？空気読めてなかった？」脳内で無限ループが始まり、最終的にこっそり削除する。', value: 'T', visual: 'Kiwimu の表面に亀裂が入り、じわじわ崩れていく' },
      ],
    },
  ],
};

export const quizBJP: QuizType = {
  id: 'B',
  title: 'おひとりさま・まったり生存原型診断',
  description: '人生が生存ゲームなら、この5問があなたの隠れた才能を暴く。',
  questions: [
    {
      id: 'q1',
      dimension: 'E/I',
      text: '半知り合いの同僚に「週末みんなでごはん行かない？」と誘われた。内心は？',
      options: [
        { text: '「行く行く！週末特に予定ないし、新しい出会いもありかも。」乗り気で即答するタイプ。', value: 'E', visual: 'Kiwimu が帽子をかぶって玄関へ飛び出す' },
        { text: '表情は笑顔のまま、脳内では「断る口実リスト」が猛スピードで生成されている。「今週ちょっと忙しくて……」', value: 'I', visual: 'Kiwimu が硬い殻を作り、入口をふさぐ' },
      ],
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: '家の蛇口が壊れた。修理方法を検索したら、どこに辿り着く？',
      options: [
        { text: '「30秒でわかる直し方」の動画を探して手順1→2→3と確実に実行。原理より「次に何をする？」が大事。', value: 'S', visual: 'Kiwimu が手順書になって一行ずつ表示される' },
        { text: '気づいたら「水道の歴史」や「水圧の仕組み」を読んでいた。肝心の修理はまだ始まっていない。', value: 'N', visual: 'Kiwimu が配管の奥へ探検に出かけていく' },
      ],
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: 'ドラマで主人公が「感情的になりすぎて」ありえない行動をした。あなたの反応は？',
      options: [
        { text: '「論理的じゃない。一言確認するだけで済むのに、なぜ言わないんだ。」イライラが止まらない。', value: 'T', visual: 'Kiwimu が「論理エラー」の札を静かに掲げる' },
        { text: '「わかる。そういう時って頭より感情が先に出るよね……」と主人公に自然と感情移入してしまう。', value: 'F', visual: 'Kiwimu が主人公と一緒に涙を流す' },
      ],
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: '「今週末は完全に何もしない日にする」と決めていた。友人から「近くにいるから顔出す！」のメッセ。',
      options: [
        { text: '崩壊寸前。「何もしない」も私の予定表に入っていたのに。気持ちを立て直すのに時間がかかる。', value: 'J', visual: 'Kiwimu の行事曆が乱れ、表面が焦げはじめる' },
        { text: '「ん、来ていいよ。どうせ転がってるだけだし。」スケジュール変更への耐性が高い。', value: 'P', visual: 'Kiwimu がカーペットになって「踏んでいいよ」と言っている' },
      ],
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: '仕事のグループチャットに、明らかに送るはずじゃなかった画像を誤送信した。',
      options: [
        { text: '秒で「すみません、誤送信でした🙏」を送って完結。3分後には忘れてる。', value: 'A', visual: 'Kiwimu が優雅に画面を滑って何事もなかった顔をする' },
        { text: '削除したのに「上司は見た？」「既読ついてる？」と2時間後もまだ引きずっている。', value: 'T', visual: 'Kiwimu が緊張で汗をかきながらじわじわ溶けていく' },
      ],
    },
  ],
};

// ─── South Korea (ko-KR) ──────────────────────────────────────────────────────

export const quizAKR: QuizType = {
  id: 'A',
  title: '디지털 불안 생존 유형 테스트',
  description: '5문항으로 알아보는 나의 2026 디지털 생존 원형. 나는 어떤 소셜 동물?',
  questions: [
    {
      id: 'q1',
      dimension: 'E/I',
      text: '금요일 심야, 영혼까지 탈탈 털렸는데 침대에서 스마트폰을 켜면 제일 먼저 하는 건?',
      options: [
        { text: '카카오톡·인스타·틱톡을 빠르게 돌려보며 "다들 뭐 해? 오늘 무슨 일 있었어?" 확인. 연결되어 있다는 느낌 자체가 충전임.', value: 'E', visual: 'Kiwimu 가 모든 SNS를 동시에 접속하려고 부풀어 오른다' },
        { text: '방해금지 모드 켜고, 비공개 계정이나 유튜브로 소리 없이 퍼질러봄. 지금 "살아있는 사람"이랑 엮이고 싶지 않음.', value: 'I', visual: 'Kiwimu 가 아무도 찾지 못하는 구석으로 작아져서 숨어든다' },
      ],
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: 'SNS에서 수십만 공유된 논란 게시물 발견. 내 뇌가 제일 먼저 하는 건?',
      options: [
        { text: '댓글창 직행. 타임라인·팩트 체크·누가 뭘 잘못했는지부터 정리. "정확한 정보를 파악해야 판단할 수 있다"가 신조.', value: 'S', visual: 'Kiwimu 가 정밀 스크레이퍼로 정보를 납작하게 정렬한다' },
        { text: '사건 자체보다 "이게 왜 이렇게 퍼졌지? 사람들이 왜 이걸 원하지?"를 먼저 생각함. 어느새 노트 앱에 생각이 펼쳐짐.', value: 'N', visual: 'Kiwimu 가 구름이 되어 논란 위를 둥둥 떠다닌다' },
      ],
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: '친구가 단톡방에 "나 또 직장에서 실수했어ㅠㅠ"라고 울고 있다면?',
      options: [
        { text: '"일단 스크린샷 해. 상황 정리해보자. 대응 방법 먼저 찾아보자." 해결책부터 제시하는 타입.', value: 'T', visual: 'Kiwimu 가 소금 한 꼬집이 되어 냉정하게 굳는다' },
        { text: '"아이고 많이 힘들었겠다😭 지금 통화 가능해?" 감정을 먼저 받아주는 게 우선.', value: 'F', visual: 'Kiwimu 가 달콤하게 녹아서 친구를 감싼다' },
      ],
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: '카카오톡·인스타 미확인 알림 뱃지(숫자), 지금 솔직한 상태는?',
      options: [
        { text: '빨간 숫자가 쌓이면 불편해서 못 살음. 다 읽고 정리해야 마음이 편한 타입.', value: 'J', visual: 'Kiwimu 가 완벽한 별모양으로 짜여져 뱃지 제로에 만족한다' },
        { text: '999+ 쌓여도 별 상관 없음. "언젠간 보겠지"의 정신으로 그냥 놔둠.', value: 'P', visual: 'Kiwimu 가 책상 위에 흐물흐물 퍼져서 굳어버린다' },
      ],
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: '공들인 릴스나 스토리 올렸는데 30분째 반응이 없을 때?',
      options: [
        { text: '"뭐, 알고리즘 문제겠지." 폰 내려놓고 야식 시키러 감. 크게 신경 안 씀.', value: 'A', visual: 'Kiwimu 가 완벽한 크림 상태로 아무렇지 않게 흔들린다' },
        { text: '"내가 공감을 잘못 건드렸나? 분위기 파악 못 한 건가?" 뇌에서 무한 루프가 시작되고, 결국 몰래 삭제.', value: 'T', visual: 'Kiwimu 가 땀을 뻘뻘 흘리며 가장자리부터 녹아내린다' },
      ],
    },
  ],
};

export const quizBKR: QuizType = {
  id: 'B',
  title: '잠수 & 갓생 생존 유형 테스트',
  description: '인생이 생존 게임이라면, 이 5가지 선택이 당신의 숨겨진 재능을 드러낸다.',
  questions: [
    {
      id: 'q1',
      dimension: 'E/I',
      text: '애매하게 아는 동료가 갑자기 "이번 주말에 다 같이 밥 먹을래?"라고 하면 속으로는?',
      options: [
        { text: '"오, 괜찮네! 이번 주말 딱히 계획 없는데." 즉각 수락하는 타입.', value: 'E', visual: 'Kiwimu 가 신나게 모자를 쓰고 현관을 뛰어나간다' },
        { text: '표정은 웃으면서 뇌는 "오늘 일정 있다고 할까", "몸이 좀 안 좋다고 할까" 핑계 목록이 빠르게 생성됨.', value: 'I', visual: 'Kiwimu 가 단단한 껍데기를 만들어 입구를 틀어막는다' },
      ],
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: '집 수도꼭지가 고장났다. 수리 방법을 검색하다가 어디에 도착하게 되나?',
      options: [
        { text: '"30초 완성 수리법" 영상을 찾아 1단계→2단계 순서대로 따라감. 원리보단 "다음엔 뭐 하면 되지?"가 중요.', value: 'S', visual: 'Kiwimu 가 설명서가 되어 한 줄씩 표시된다' },
        { text: '어느새 "수도의 역사"나 "수압의 원리"를 보고 있음. 정작 수리는 아직 시작도 못 함.', value: 'N', visual: 'Kiwimu 가 탐정 모자를 쓰고 수도관 속으로 모험을 떠난다' },
      ],
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: '드라마에서 주인공이 "감정적으로" 말도 안 되는 선택을 했다. 나의 반응은?',
      options: [
        { text: '"저게 말이 돼? 한마디만 솔직하게 말하면 끝날 걸." 논리적으로 이해 안 됨.', value: 'T', visual: 'Kiwimu 가 "논리 오류" 팻말을 차갑게 들어올린다' },
        { text: '"아… 그 상황에서 그럴 수밖에 없었겠다." 주인공 마음에 공감이 먼저 됨.', value: 'F', visual: 'Kiwimu 가 주인공과 함께 눈물을 흘린다' },
      ],
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: '"이번 주말은 완전 집콕 모드"로 세팅해뒀는데, 친구가 갑자기 "나 근처야, 잠깐 들러도 돼?"라고 하면?',
      options: [
        { text: '멘붕. 아무것도 안 하는 것도 내 계획의 일부였는데. 마음 정리하는 데 시간이 걸림.', value: 'J', visual: 'Kiwimu 의 달력이 뒤집어지며 표면이 타기 시작한다' },
        { text: '"어, 와. 어차피 나 뒹굴고 있었잖아." 변화에 큰 저항 없음.', value: 'P', visual: 'Kiwimu 가 카펫이 되어 "밟아도 돼"라고 말한다' },
      ],
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: '회사 단톡방에 실수로 이상한 짤을 보냈다. 그다음에?',
      options: [
        { text: '바로 "오발송입니다ㅠ" 치고 없던 일로 함. 3분 뒤엔 까먹음.', value: 'A', visual: 'Kiwimu 가 우아하게 화면을 미끄러지며 아무 일 없다는 듯 지나간다' },
        { text: '삭제했는데도 "팀장님 봤을까?", "이미지 망한 건 아닐까?" 두 시간 동안 머릿속에서 지워지지 않음.', value: 'T', visual: 'Kiwimu 가 식은땀을 흘리며 가장자리부터 흘러내린다' },
      ],
    },
  ],
};

// ─── United States (en-US) ────────────────────────────────────────────────────

export const quizAEN: QuizType = {
  id: 'A',
  title: 'Digital Anxiety Survival Type',
  description: '5 questions to find your 2026 digital survival archetype. Which social animal are you?',
  questions: [
    {
      id: 'q1',
      dimension: 'E/I',
      text: 'Friday night, your soul has officially left your body after a brutal week. You\'re in bed — what\'s the first thing you do on your phone?',
      options: [
        { text: 'Rapid-fire between Instagram, TikTok, and the group chat checking what everyone\'s up to. Being "plugged in" is honestly how I recharge.', value: 'E', visual: 'Kiwimu expands trying to connect to every platform at once' },
        { text: 'Switch to a private alt account or go full Cozy Hermit mode — mindlessly watching YouTube with zero social obligations. No real people tonight.', value: 'I', visual: 'Kiwimu shrinks and hides deep inside the private account darkness' },
      ],
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: 'You see a massively viral controversy post blowing up all over your feed. Your brain\'s first move is?',
      options: [
        { text: 'Straight to the comment section for a tea recap. I need the timeline, the receipts, and who did what before I can form an opinion.', value: 'S', visual: 'Kiwimu becomes a precision spatula, scraping information perfectly flat' },
        { text: 'Skip the details, go straight to "why is this happening and what does it say about us as a society?" You\'ve already started a Notes app essay.', value: 'N', visual: 'Kiwimu floats up into a cloud, drifting above the drama' },
      ],
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: 'Your friend drops "I completely bombed at work today 😭" in the group chat. What do you send first?',
      options: [
        { text: '"Okay screenshot everything. Let\'s break down exactly what happened and figure out your next move." Problem-solving mode activated.', value: 'T', visual: 'Kiwimu instantly freezes into a rational ice brick of pure logic' },
        { text: '"That sounds so hard, I\'m so sorry 😭 Are you okay? Can we call?" Emotional support first, strategy later.', value: 'F', visual: 'Kiwimu melts into a warm puddle of sweetness, surrounding the friend' },
      ],
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: 'Real talk — what does your notification badge situation actually look like right now?',
      options: [
        { text: 'Unread badges give me actual anxiety. I clear them obsessively because inbox zero is the only way I can feel like my life is under control.', value: 'J', visual: 'Kiwimu is squeezed into a perfect star shape, deeply satisfied by zero badges' },
        { text: '847 unread and I simply do not care. "I\'ll get to it eventually" is a lifestyle choice and I\'m committed to it.', value: 'P', visual: 'Kiwimu spreads across the desk and solidifies into a happy blob' },
      ],
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: 'You post your absolute best meme or take and it gets zero traction after 30 minutes. What happens?',
      options: [
        { text: '"Eh, the algorithm just wasn\'t on my side today." Puts phone down and orders food. Totally unbothered.', value: 'A', visual: 'Kiwimu gives a perfectly unbothered little jiggle and moves on' },
        { text: '"Did I misread the room? Was it cringe?" The spiral begins, and you quietly delete it an hour later.', value: 'T', visual: 'Kiwimu starts sweating through the edges, slowly collapsing inward' },
      ],
    },
  ],
};

export const quizBEN: QuizType = {
  id: 'B',
  title: 'Low-key Homebody Survival Type',
  description: 'If life is a survival game, these 5 choices will reveal your soul\'s hidden talent.',
  questions: [
    {
      id: 'q1',
      dimension: 'E/I',
      text: 'A work acquaintance you barely know suggests "Hey, want to grab drinks with the team this weekend?" Your internal reaction?',
      options: [
        { text: '"Yeah, I\'m down! I don\'t have solid plans and it could be fun." Immediate yes — let\'s see what happens.', value: 'E', visual: 'Kiwimu happily puts on a hat and leaps toward the door' },
        { text: 'You smile and nod on the outside while your brain is already generating a list of plausible excuses at full speed.', value: 'I', visual: 'Kiwimu instantly builds a thick shell and blocks the entrance' },
      ],
    },
    {
      id: 'q2',
      dimension: 'S/N',
      text: 'Your Wi-Fi goes down or an app crashes. When you look up the fix online, where do you actually end up?',
      options: [
        { text: 'You find a 60-second tutorial that shows you exactly what to click. Step-by-step is the only acceptable format. Just tell me what to do next.', value: 'S', visual: 'Kiwimu becomes a clear instruction manual showing one line at a time' },
        { text: 'You started looking up the fix and somehow ended up reading about the history of router technology. Still haven\'t fixed the Wi-Fi.', value: 'N', visual: 'Kiwimu puts on a detective hat and ventures deep into the router' },
      ],
    },
    {
      id: 'q3',
      dimension: 'T/F',
      text: 'In a show or movie, the main character makes a completely irrational decision because of their emotions. Your reaction?',
      options: [
        { text: '"Why?? They could\'ve just had ONE honest conversation and avoided all of this." The frustration is physically painful.', value: 'T', visual: 'Kiwimu holds up a cold "Logic Error" sign with zero sympathy' },
        { text: 'Even though it was objectively dumb, you get it. "They were scared of losing something. I\'ve felt that."', value: 'F', visual: 'Kiwimu cries along with the main character, completely invested' },
      ],
    },
    {
      id: 'q4',
      dimension: 'J/P',
      text: 'You\'ve mentally committed to a full "Do Nothing" day. A friend texts: "Hey I\'m near your place, can I come over?" What happens?',
      options: [
        { text: 'Mild crisis. "Doing nothing" WAS the plan. You need significant time to emotionally recalibrate before you can even respond.', value: 'J', visual: 'Kiwimu\'s calendar flips and its surface starts to singe' },
        { text: '"Sure, come through. I\'m just existing on the couch anyway." No drama, no resistance, no problem.', value: 'P', visual: 'Kiwimu becomes a carpet and says "you can step on me, it\'s fine"' },
      ],
    },
    {
      id: 'q5',
      dimension: 'A/T',
      text: 'You accidentally send a mildly chaotic meme to the WRONG group chat — the one with your boss in it. What now?',
      options: [
        { text: 'Delete, send a quick "wrong chat lol sorry 😅," and genuinely move on. It\'s not that deep and you\'re already thinking about dinner.', value: 'A', visual: 'Kiwimu glides elegantly across the screen like nothing happened' },
        { text: 'You deleted it immediately but spent the next two hours wondering "Did they see it? Is my reputation ruined now?" The anxiety is very real.', value: 'T', visual: 'Kiwimu sweats profusely, edges slowly dripping down in slow motion' },
      ],
    },
  ],
};

// ─── Locale map ───────────────────────────────────────────────────────────────

export type V15Locale = 'zh-TW' | 'ja-JP' | 'ko-KR' | 'en-US';

export const V15_QUIZ_A: Record<V15Locale, QuizType> = {
  'zh-TW': {
    id: 'A',
    title: '數位焦慮生存原型',
    description: '5 題測出你的 2026 數位生存原型，你是哪種社交動物？',
    questions: [], // populated from main data.ts quizA
  },
  'ja-JP': quizAJP,
  'ko-KR': quizAKR,
  'en-US': quizAEN,
};

export const V15_QUIZ_B: Record<V15Locale, QuizType> = {
  'zh-TW': {
    id: 'B',
    title: '潛水躺平生存原型',
    description: '如果人生是一場生存遊戲，這 5 個抉擇將決定你靈魂深處的隱藏天賦。',
    questions: [], // populated from main data.ts quizB
  },
  'ja-JP': quizBJP,
  'ko-KR': quizBKR,
  'en-US': quizBEN,
};
