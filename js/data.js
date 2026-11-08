/* Momentea — 데모 데이터 (Figma 시안 기준) */
window.MT_DATA = (function () {
  const P = {
    earlgrey:  { brand: '아마드티', name: '얼그레이 홍차', img: 'earlgrey', color: '#0d3b28', type: '잎차형', cat: '블렌딩차', rating: '4.0', count: '465', rec: '따뜻하게 | 보통 진하기로 | 3분 14초', sg: '얼그레이 홍차', ord: 1 },
    samda:     { brand: '오설록', name: '삼다 꿀배 티', short: '삼다 꿀배차', img: 'samda', color: '#1d5784', type: '티백형', cat: '블렌딩차', rating: '4.3', count: '812', rec: '따뜻하게 | 보통 진하기로 | 3분 30초' },
    chamomile: { brand: '쌍계명차', name: '캐모마일차', img: 'chamomile', color: '#855902', type: '티백형', cat: '꽃차', rating: '4.1', count: '1,203', rec: '따뜻하게 | 연하게 | 4분' },
    sanghwang: { brand: '차연', name: '상황버섯티백', img: 'sanghwang', color: '#8d3500', type: '티백형', cat: '전통차', rating: '3.9', count: '342', rec: '뜨겁게 | 진하게 | 6분 10초' },
    ppong:     { brand: '하립골', name: '뽕잎차', img: 'ppong', color: '#3d2f24', type: '잎차형', cat: '전통차', rating: '4.7', count: '1,432', rec: '따뜻하게 | 보통 진하기로 | 3분 40초' },
    yangchul:  { brand: '양출마켓', name: '양출 채소차', img: 'yangchul', color: '#7b2b3c', type: '티백형', cat: '블렌딩차', rating: '4.0', count: '1,027', rec: '차갑게 | 보통 진하기로 | 7분 12초' },
    matcha:    { brand: '오설록', name: '프리미엄 말차', img: 'matcha', color: '#2e281f', type: '잎차형', cat: '차나무', rating: '3.6', count: '2,431', rec: '뜨겁게 | 연하게 | 1분 30초' },
    dwaeji:    { brand: '순수한집', name: '여주 돼지감자차', img: 'dwaeji', color: '#483522', type: '티백형', cat: '전통차', rating: '3.2', count: '215', rec: '뜨겁게 | 아주 진하게 | 6분 47초' },
    yeonip:    { brand: '티지', name: '티지 클린 수제 연잎차', img: 'yeonip', color: '#48251f', type: '잎차형', cat: '전통차', rating: '4.4', count: '53', rec: '차갑게 | 아주 연하게 | 5분 23초' },
    peach:     { brand: '샘표', name: '납작 복숭아 티백', short: '납작 복숭아차', img: 'peach', color: '#b32e42', type: '티백형', cat: '과일차', rating: '4.2', count: '2,148', rec: '차갑게 | 보통 진하기로 | 2분 40초' },
    sakuranbo: { brand: '루피시아', name: '사쿠란보 체리', img: 'sakuranbo', color: '#315163', type: '잎차형', cat: '과일차', rating: '4.8', count: '751', rec: '따뜻하게 | 보통 진하기로 | 3분', sg: '사쿠란보 홍차', tags: '홍차', ord: 6 },
    yeongeun:  { brand: '티지', name: '티지 리셋 수제 연근차', img: 'yeongeun', color: '#55514a', type: '잎차형', cat: '전통차', rating: '3.6', count: '231', rec: '따뜻하게 | 보통 진하기로 | 4분 20초' },
    /* 홍차 검색 (Figma '클로드 확인용' 168:3117 · 168:3235) */
    martinez:  { brand: '도밍고', name: '마르티네즈에칸토 꿀홍차', sg: '마르티네즈에칸토 홍차', img: 'martinez', color: '#b3261e', type: '티백형', cat: '블렌딩차', rating: '4.0', count: '161', rec: '차갑게 | 아주 진하게 | 16분 23초', ord: 2 },
    fig:       { brand: '오설록', name: '무화과 쇼콜라 블랙티', sg: '무화과 쇼콜라 홍차', tags: '홍차', img: 'fig', color: '#7a3b5a', type: '티백형', cat: '블렌딩차', rating: '4.0', count: '382', rec: '차갑게 | 연하게 | 2분 18초', ord: 3 },
    boseong:   { brand: '청룡다원OrganicTEA', name: '유기농 보성홍차', sg: '유기농 보성홍차', img: 'boseong', color: '#8a4a12', type: '잎차형', cat: '차나무', rating: '4.0', count: '149', rec: '따뜻하게 | 보통 진하기로 | 3분 14초', ord: 4 },
    happyterrace: { brand: '해피테라스', name: '홍차 얼그레이 삼각티백', img: 'happyterrace', color: '#c2185b', type: '티백형', cat: '블렌딩차', rating: '4.0', count: '149', rec: '따뜻하게 | 보통 진하기로 | 2분', ord: 4.5, sgHide: true },
    daehan:    { brand: '대한다업', name: '클래식 대한 홍차 티백', sg: '클래식 대한 홍차 티백', img: 'daehan', color: '#5a1f24', type: '티백형', cat: '차나무', rating: '4.2', count: '287', rec: '따뜻하게 | 보통 진하기로 | 3분', ord: 5 },
    royal:     { brand: '포트넘앤메이슨', name: '로얄블렌드 틴 홍차', sg: '로얄블렌드 틴 홍차', img: 'royal', color: '#1f7a72', type: '잎차형', cat: '차나무', rating: '4.6', count: '1,082', rec: '따뜻하게 | 조금 진하게 | 4분', ord: 7 },
    tetley:    { brand: '테틀리', name: '오리지널 홍차', sg: '테틀리 홍차', img: 'tetley', color: '#1f3f9a', type: '티백형', cat: '차나무', rating: '3.9', count: '2,315', rec: '뜨겁게 | 조금 진하게 | 3분 30초', ord: 8, fit: 'contain' },
    lychee:    { brand: '딜마', name: '리치 홍차', sg: '리치 홍차', img: 'lychee', color: '#5b1a2a', type: '티백형', cat: '과일차', rating: '4.1', count: '524', rec: '차갑게 | 보통 진하기로 | 3분', ord: 9 },
    dilmah_eg: { brand: '딜마', name: '얼그레이 홍차', sg: '딜마 얼그레이 홍차', img: 'dilmah_eg', color: '#245b5e', type: '잎차형', cat: '블렌딩차', rating: '4.3', count: '976', rec: '따뜻하게 | 보통 진하기로 | 3분 30초', ord: 10 },
    pansy:     { brand: '보나플로', name: '팬지꽃차', img: 'pansy', color: '#5b3f8c', type: '잎차형', cat: '꽃차', rating: '4.5', count: '386', rec: '따뜻하게 | 연하게 | 3분' },
    morninghip: { brand: '데이오브힙', name: '모닝힙 블렌드', img: 'd_morninghip', color: '#c43d55', type: '티백형', cat: '과일차', rating: '4.6', count: '528', rec: '따뜻하게 | 보통 진하기로 | 4분' },
    dilmah:    { brand: '딜마', name: '마살라 차이 홍차', sg: '딜마 홍차', img: 'dilmah', color: '#2b2b2b', type: '잎차형', cat: '블렌딩차', rating: '4.0', count: '318', rec: '뜨겁게 | 조금 진하게 | 5분', ord: 11 }
  };
  /* 제품 상세·후기 기록 화면용 — Figma '클로드 확인용' 시안의 이미지 크롭(d_*, r_*)과 후기 배경색 */
  const RBG = {"pansy": "#5e3a56", "samda": "#35749b", "yangchul": "#1d5a22", "dwaeji": "#5d4324", "peach": "#94443f", "chamomile": "#8b7846", "earlgrey": "#0d3b28", "yeonip": "#553b34", "yeongeun": "#245f7c", "sanghwang": "#913c06", "sakuranbo": "#476574", "ppong": "#474137", "matcha": "#2d410d", "martinez": "#662525", "morninghip": "#969190", "fig": "#6b3a52", "boseong": "#6e4a24", "happyterrace": "#8e2a55", "daehan": "#5a2a2c", "royal": "#2f6460", "tetley": "#2b3f7a", "lychee": "#5b2a36", "dilmah_eg": "#2f5456", "dilmah": "#3a3a3a"};
  Object.keys(P).forEach(k => {
    const p = P[k]; p.id = k;
    p.rbg = RBG[k] || p.color;
    p.rpos = { fig: '50% 42%', boseong: '50% 33%', happyterrace: '50% 30%', daehan: '50% 12%', royal: '50% 74%', tetley: '50% 22%', lychee: '50% 75%', dilmah_eg: '50% 73%', dilmah: '50% 55%' }[k] || null;
    if (['pansy','samda','yangchul','dwaeji','peach','chamomile','earlgrey','yeonip','yeongeun','sanghwang','sakuranbo','ppong','matcha','martinez','morninghip'].indexOf(k) >= 0) { p.dimg = 'd_' + k; p.rimg = 'r_' + k; }
    p.full = p.name.indexOf(p.brand) === 0 ? p.name : p.brand + ' ' + p.name;
  });

  return {
    products: P,
    recentBanners: [
      { id: 'earlgrey', title: '아마드티 얼그레이 홍차', sub: '이 차를 7일 전에 마지막으로 즐겼어요', bg: '#0d3b28' },
      { id: 'yeongeun', title: '티지 리셋 수제 연근차', sub: '이 차를 5일 전에 마지막으로 즐겼어요', bg: '#55514a' },
      { id: 'yangchul', title: '양출마켓 양출채소차', sub: '이 차를 5일 전에 마지막으로 즐겼어요', bg: '#7b2b3c' },
      { id: 'sanghwang', title: '차연 상황버섯티백', sub: '이 차를 5일 전에 마지막으로 즐겼어요', bg: '#8d3500' },
      { id: 'ppong', title: '하립골 뽕잎차', sub: '이 차를 5일 전에 마지막으로 즐겼어요', bg: '#3d2f24' }
    ],
    frequent: [
      { id: 'samda', title: '삼다 꿀배차', sub: '2일 전에 마셨어요', bg: '#1d5784', top: -31.05, heart: true },
      { id: 'chamomile', title: '캐모마일차', sub: '7일 전에 마셨어요', bg: '#855902', top: -31.05, heart: true },
      { id: 'sanghwang', title: '상황버섯티백', sub: '3일 전에 마셨어요', bg: '#8d3500', top: -31.05, heart: false },
      { id: 'ppong', title: '뽕잎차', sub: '5일 전에 마셨어요', bg: '#3d2f24', top: -39.85, heart: true }
    ],
    history: [
      { date: '11월 3일 (화)', items: [{ id: 'yangchul', meta: '차갑게 | 보통 진하기 | 7분 12초', rating: '4.0', count: '1,027개' }] },
      { date: '10월 23일 (금)', items: [
        { id: 'matcha', meta: '뜨겁게 | 연하게', rating: '3.6', count: '2.431개' },
        { id: 'dwaeji', meta: '뜨겁게 | 아주 진하게 | 6분 47초', rating: '3.2', count: '215개' }
      ] },
      { date: '10월 23일 (금)', items: [{ id: 'yeonip', meta: '차갑게 | 아주 연하게 | 5분 23초', rating: '4.4', count: '53개' }] }
    ],
    week: { days: ['월', '화', '수', '목', '금', '토', '일'], on: [1, 1, 1, 0, 1, 0, 0], today: 5, count: 4, diff: 2 },

    popularBanners: [
      { id: 'peach', title: '샘표 납작복숭아 티백', sub: '이번 주 2,148명이 즐겼어요', bg: '#b32e42' },
      { id: 'yeonip', title: '티지 클린 수제 연잎차', sub: '이번 주 1,865명이 즐겼어요', bg: '#48251f' },
      { id: 'sakuranbo', title: '루피시아 사쿠란보 체리', sub: '이번 주 1,432명이 즐겼어요', bg: '#315163' },
      { id: 'matcha', title: '오설록 프리미엄 말차', sub: '이번 주 875명이 즐겼어요', bg: '#2e281f' },
      { id: 'dwaeji', title: '순수한집 여주 돼지감자차', sub: '이번 주 713명이 즐겼어요', bg: '#483522' }
    ],
    rankFilters: ['티백형', '잎차형', '블렌딩차', '전통차', '과일차', '꽃차'],
    ranks: {
      '잎차형': [['earlgrey', '4.5', '1,564', '-'], ['yeonip', '3.6', '567', '-'], ['sakuranbo', '4.8', '751', '▼ 2'], ['ppong', '4.7', '1,432', '-'], ['yeongeun', '3.6', '231', '▲ 3']],
      '티백형': [['peach', '4.2', '2,148', '-'], ['samda', '4.3', '812', '▲ 1'], ['yangchul', '4.0', '465', '▼ 1'], ['chamomile', '4.1', '1,203', '-'], ['dwaeji', '3.2', '215', '▲ 2']],
      '블렌딩차': [['earlgrey', '4.5', '1,564', '-'], ['samda', '4.3', '812', '▲ 1'], ['yangchul', '4.0', '1,027', '▼ 1'], ['peach', '4.2', '2,148', '▲ 2'], ['sakuranbo', '4.8', '751', '-']],
      '전통차': [['ppong', '4.7', '1,432', '-'], ['sanghwang', '3.9', '342', '▲ 2'], ['yeonip', '3.6', '567', '-'], ['dwaeji', '3.2', '215', '▼ 2'], ['yeongeun', '3.6', '231', '-']],
      '과일차': [['sakuranbo', '4.8', '751', '-'], ['peach', '4.2', '2,148', '▲ 1'], ['samda', '4.3', '812', '▼ 1'], ['yangchul', '4.0', '1,027', '▲ 4'], ['chamomile', '4.1', '1,203', '-']],
      '꽃차': [['chamomile', '4.1', '1,203', '-'], ['yeonip', '3.6', '567', '▲ 1'], ['peach', '4.2', '2,148', '-'], ['sakuranbo', '4.8', '751', '▼ 2'], ['matcha', '3.6', '2,431', '▲ 1']]
    },
    kindCards: [
      { id: 'yangchul', title: '양출 채소차', sub: '블렌딩차 1위', bg: '#7b2b3c', top: -31.05, heart: true },
      { id: 'sakuranbo', title: '사쿠란보 체리', sub: '과일차 1위', bg: '#315163', top: -31.05, heart: false },
      { id: 'ppong', title: '뽕잎차', sub: '잎차형 1위', bg: '#3d2f24', top: -39.85, heart: true },
      { id: 'peach', title: '납작 복숭아차', sub: '티백형 1위', bg: '#b32e42', top: -20.7, heart: true },
      { id: 'sanghwang', title: '상황버섯티백', sub: '전통차 1위', bg: '#8d3500', top: -39.85, heart: true }
    ],

    tasteTags: ['#잎차형', '#달달한', '#연하게', '#차갑게'],
    matches: [
      { id: 'ppong', pct: 64, name: '하립골 뽕잎차', top: -49.54, rows: [[['#담백한', 1], ['#잎차형', 1], ['#고소한', 1]], [['#따뜻하게 마시는', 0], ['#떫은', 0]]] },
      { id: 'pansy', pct: 63, name: '보나플로 팬지꽃차', top: null, rows: [[['#잎차형', 1], ['#따뜻하게 마시는', 0]], [['#떫은', 0], ['#고소한', 1], ['#담백한', 1]]] },
      { id: 'yangchul', pct: 89, name: '양출 채소차', top: -35.96, rows: [[['#티백형', 0], ['#고소한', 1], ['#차갑게 마시는', 1]], [['#달달한', 1], ['#담백한', 1], ['#떫지 않은', 1]]] },
      { id: 'sanghwang', pct: 75, name: '차연 상황버섯티백', top: null, rows: [[['#담백한', 1], ['#고소한', 1], ['#떫지 않은', 1]], [['#티백형', 0], ['#차갑게 마시는', 1], ['#전통차', 0]]] }
    ],
    peerReviews: [
      { av: 'av_shadow', name: 'shadowhunter', sub: '납작 복숭아차 · 일치 90%', text: '복숭아향이 진한데 달기만 하지 않아서 좋아요. 2분 40초가 딱이에요.' },
      { av: 'av_kim', name: '김희재', sub: '메밀차 · 일치 76%', text: '12시간 우려도 안 쓰고 안 떫고 최고임. 솔직히 냉침차로는 동서 메밀차 이길 게 없을듯. 추천함.' },
      { av: 'av_forest', name: 'forestwalker', sub: '실버 문 티 · 일치 84%', text: '은은해서 오후에 마시기 좋네요. 오래 우려도 안 떫어서 더 좋고요. 홍차치고 꽤 연한 편에 속하는 것 같습니다..' }
    ],

    recentKeywords: ['잎차형', '캐모마일차', '보리차', '자두홍차'],
    categories: [
      { key: '차나무', icon: 'cat_leaf', bg: '#e2f1ee', leaf: true },
      { key: '블렌딩차', icon: 'cat_blend', bg: '#efe6f3' },
      { key: '전통차', icon: 'cat_trad', bg: '#f1ebdf' },
      { key: '꽃차', icon: 'cat_flower', bg: '#fbe6ea' }
    ],
    resultFilters: ['잎차형', '티백형', '차나무', '전통차', '블렌딩차', '꽃차', '과일차'],

    tips: [
      '차의 어원은 차나무잎을 이용한 종류를 이르는 말로 시작했어요. 차나무잎에는 카페인이 함유되어 있는데 홍차도 차나무잎으로 만든 차종이에요',
      '얼그레이는 홍차에 베르가못 향을 입힌 블렌딩 티예요. 너무 오래 우리면 떫은맛이 강해질 수 있어요',
      '찻잎이 물속에서 천천히 펼쳐지는 것을 ‘점핑’이라고 해요. 점핑이 잘 될수록 향이 풍부하게 우러나요'
    ],
    /* 타이머 팁 — 배경 영상 차종별 (팬지 · 히비스커스 · 홍차/보이차 · 녹차 · 캐모마일), 회차마다 섞어서 보여줌 */
    kindTips: {
      pansy: [
        '팬지라는 이름은 프랑스어 ‘팡세(생각)’에서 왔어요. 꽃잎 무늬가 생각에 잠긴 얼굴처럼 보여서 붙은 이름이에요',
        '팬지꽃의 보랏빛은 안토시아닌 색소예요. 레몬즙을 몇 방울 떨어뜨리면 찻물이 분홍빛으로 바뀌어요',
        '꽃차는 끓는 물을 부어야 꽃잎이 활짝 펴져요. 투명한 유리잔에 우리면 꽃이 피는 모습을 볼 수 있어요',
        '팬지꽃차는 카페인이 없어서 저녁에 마셔도 부담이 적어요',
        '우리고 남은 팬지 꽃잎은 먹을 수 있는 꽃이라 샐러드나 디저트 장식으로 써도 좋아요'
      ],
      hibiscus: [
        '히비스커스차로 우리는 부분은 꽃잎이 아니라 붉은 꽃받침이에요. 새콤한 맛도 꽃받침의 유기산에서 나와요',
        '찻물의 붉은색은 안토시아닌 색소예요. 레몬을 넣으면 더 선명한 루비색이 돼요',
        '히비스커스는 오래 우릴수록 신맛이 강해져요. 4~5분 안쪽에서 꺼내는 게 좋아요',
        '이집트에서는 히비스커스차를 ‘카르카데’라고 부르며 차갑게 즐겨 마셔요',
        '히비스커스는 카페인이 없어서 커피 대신 아침에 마시기 좋아요'
      ],
      black: [
        '홍차와 녹차는 같은 차나무 잎으로 만들어요. 찻잎을 충분히 산화시키면 홍차가 돼요',
        '서양에서는 마른 잎 색을 보고 ‘블랙티’, 동양에서는 붉은 찻물 색을 보고 ‘홍차’라고 불러요',
        '홍차는 95~100℃의 뜨거운 물로 우려야 향이 잘 살아나요. 찻잔도 미리 데워두면 좋아요',
        '보이차는 중국 윈난성에서 만드는 후발효차예요. 오래 숙성할수록 맛이 둥글고 부드러워져요',
        '보이차는 첫 물을 짧게 우려 버리는 ‘세차’를 하면 묵은 향이 정돈되고 맛이 깔끔해져요'
      ],
      green: [
        '녹차는 찻잎을 덖거나 쪄서 산화를 막아요. 그래서 초록빛과 풋풋한 향이 그대로 남아요',
        '녹차는 70~80℃로 한 김 식힌 물에 우려야 쓴맛과 떫은맛이 덜해요',
        '말차는 그늘에서 키운 찻잎을 곱게 갈아 만들어요. 찻잎을 통째로 마시는 셈이에요',
        '곡우 전에 딴 어린 잎으로 만든 녹차를 ‘우전’이라고 해요. 맛이 가장 여리고 달아요',
        '녹차의 감칠맛은 테아닌이라는 아미노산에서 나와요. 낮은 온도에서 더 잘 느껴져요'
      ],
      chamomile: [
        '캐모마일은 사과를 닮은 향 때문에 그리스어로 ‘땅의 사과’라는 뜻의 이름이 붙었어요',
        '캐모마일은 카페인이 없어서 잠들기 전에 마시는 차로 많이 찾아요',
        '우릴 때 뚜껑을 덮어두면 꽃의 향 성분이 날아가지 않아 향이 더 진해요',
        '꿀 한 스푼이나 따뜻한 우유를 더하면 더 부드럽게 즐길 수 있어요',
        '캐모마일은 국화과 꽃이에요. 국화과 알레르기가 있다면 조금만 맛보고 마셔요'
      ]
    },
    strengthLabels: ['아주 연하게', '조금 연하게', '보통 진하기', '조금 진하게', '아주 진하게'],
    strengthMeta: ['아주 연하게', '조금 연하게로', '보통 진하기로', '조금 진하게로', '아주 진하게로'],
    strengthSecs: [150, 174, 194, 230, 270],
    repeatLabels: ['1번', '2번', '3번', '4번', '5번'],
    reviewQs: [
      { q: '차의 맛이 얼마나 진했나요?', labels: ['아주 연하게', '조금 연하게', '적당해요', '조금 진하게', '아주 진하게'] },
      { q: '차의 향은 얼마나 강했나요?', labels: ['아주 약해요', '조금 약해요', '적당해요', '조금 강해요', '아주 강해요'] },
      { q: '차의 단 맛이 강한가요?', labels: ['달지 않아요', '조금 달아요', '적당히 달아요', '꽤 달아요', '아주 달아요'] },
      { q: '차에서 떫은 맛이 느껴졌나요?', labels: ['떫지 않아요', '조금 떫어요', '적당히 떫어요', '꽤 떫어요', '아주 떫어요'] }
    ]
  };
})();
