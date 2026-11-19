/* =========================================================
   게임 내용은 여기서 고쳐요 (인스타그램은 insta.js)
   - 항목 사이 쉼표( , ), 괄호( { } [ ] ), 따옴표( " )를 빠뜨리지 마세요.
   - 비어 있는 [ ] 는 아직 내용이 없는 곳이에요. 아래 "예시" 줄의 // 를 지우고 고쳐 쓰면 돼요.
   ========================================================= */
window.CONFIG = {
  // 잠금화면 비밀번호 (숫자 4자리)
  PASSCODE: "1107",
  // 게임 속 오늘 날짜(YYYY-MM-DD)와 시작 시각. 잠금화면 날짜는 자동으로 만들어져요
  TODAY: "2026-10-24",
  TIME: "8:00",
  // 잠금화면 왼쪽 위 통신사
  CARRIER: "SKT",
  // 사진 파일 이름 (깃허브에 이 이름으로 올리면 돼요)
  IMG: { lockWallpaper: "./wallpaper.jpg", homeWallpaper: "./wallpaper.jpg", startBg: "./start-bg.jpg" },

  // 디데이: 홈 화면 위젯 + 잠금화면 기념일 알림. days = 오늘이 며칠째인지 (시작일은 자동 계산)
  // photo 에 사진을 넣으면 위젯 배경이 사진으로 바뀌어요 (예: "./dday.jpg")
  DDAY: { partner: "♡만두♡", days: 100, time: "00:00", photo: "" },

  // 잠금화면 부재중 전화 알림 (위가 최신)
  NOTIFS: [
    // { name: "이름", text: "부재중 전화 3건", time: "2분 전" },
  ],

  // 전화 앱 최근 통화 (위가 최신)
  CALLS: [
    // { name: "이름", count: 3, missed: true, dir: "in", type: "휴대전화", time: "오전 7:58", avatar: "initial" },
  ],
  VOICEMAIL_BADGE: "",

  // 문자 앱
  MESSAGES: [
    // { id: "m1", name: "이름", unread: true, divider: "2026년 10월 23일 (금) 오후 11:02", listTime: "어제",
    //   msgs: [ { from: "them", time: "23:02", text: "문자 내용" }, { from: "me", time: "23:05", text: "내 답장" } ] },
    // { id: "m2", name: "#발신번호", kind: "spam", unread: true, divider: "오늘 오전 7:30", listTime: "오전 7:30",
    //   msgs: [ { from: "them", time: "07:30", text: "[Web발신] 스팸 문자" } ] },
  ],

  // 카카오톡
  KAKAO: {
    FRIENDS: [
      // "이름",
    ],
    // 프로필 사진 (내 사진은 "__me")
    PHOTOS: {
      // "이름": "./kk-name.jpg",
    },
    // 대화방. d = 날짜, t = 시각, from = "them"(상대) / "me"(나), 사진은 text 대신 img: "./사진.jpg"
    ROOMS: {
      // "이름": { unread: 1, msgs: [
      //   { d: "2026-10-23", t: "23:40", from: "them", text: "자?" }
      // ] },
    },
    // 자동 입력 대화 스크립트 (방 이름마다)
    SCRIPT: {
      // "이름": [
      //   { auto: "입력창을 누르면 자동으로 쳐지는 문장", reply: ["상대 답장 1", "상대 답장 2"] },
      //   { done: true }
      // ],
    }
  },

  // 사파리 뉴스 기사 (X 검색 결과에도 같이 나와요)
  NEWS: [
    // { press: "언론사", time: "1시간 전", title: "기사 제목", img: "./news-1.jpg", body: ["첫 문단", "두 번째 문단"] },
  ],

  // 사진 앱 (보관함 / 최근 삭제된 항목)
  GALLERY: [
    // { src: "./photo-1.jpg", date: "2026년 10월 1일", time: "오후 3:20" },
  ],
  TRASH: [
    // { src: "./trash-1.jpg", date: "2026년 10월 2일", time: "오후 9:10", daysLeft: 25 },
  ],

  // X(트위터) 추천 타임라인 (위에서부터 순서대로 보여요)
  // avatar: 프로필 사진 파일 (없으면 기본 사람 모양) / spin: 스핀 질문 카드 (q = 질문, a = 링크 눌렀을 때 보이는 답변, 비우면 트윗 본문)
  // quotes: 인용 목록 / reposts: 재게시 계정 목록 (비우면 알계 아이디로 자동 생성) / \n = 줄바꿈
  TWEETS: [
    { id: "t1", name: "수이!!", handle: "sui_tws42", age: "2시간", avatar: "./tw-av-1.jpg",
      text: "어쮸 VR보고 왔는데 진짜 제 눈 앞에서 사랑을 고백했음 진짜로요 인생인 투어스 브이알을 보고 난 뒤로 바뀜 왜냐면 저도 그 전에는 브이알 같은 거 보고 누가 입덕하냐고 무시했는데 이건 진짜 가상현실이 아니에요 이게 가상현실이라면 그냥 가상현실에 사는 여자가 되겠습니다",
      like: 2738, rt: 927, views: 48210, bm: 32, detailTime: "오전 6:12", quotes: [] },
    { id: "t2", name: "쑤..", handle: "ssu_0628", age: "3시간", avatar: "./tw-av-2.jpg",
      text: "내이불 활동 미당첨 아티스트가 진짜 해야 할 말: 내 이름을 제발 불러주세요 투어스들아",
      like: 5576, rt: 2098, views: 98412, bm: 267, detailTime: "오전 5:03", quotes: [] },
    { id: "t3", name: "숭숭이", handle: "sungsung_42", age: "4시간", avatar: "./tw-av-3.jpg",
      text: "와 이런 애들이 J구나 몇 수 앞을 준비하는 거지 사녹 내용은 링크 ㄱㄱ",
      spin: { q: "ㅌㅇㅅ 사녹 본확 빡세?? 이번에는 못 갔지만 다음에는 내가 될 수도 있으니까 미리미리 준비해두게..",
              a: "솔직히 안 빡세다고는 못 하겠음 왜냐면 내 앞에서 갑자기 줄 서 있다가 나오라고 하고 끌려나간 사람들을 꽤 봤으니까........ 근데 너 정도 준비성이면 ㄱㅊ을듯 사녹은 기세야 ㅇㅇ" },
      like: 576, rt: 9, views: 12830, bm: 193, detailTime: "오전 4:40", quotes: [] },
    { id: "t4", name: "공오", handle: "gongoh_05", age: "5시간", avatar: "./tw-av-4.jpg",
      text: "극단적 선택은 내가 이런 정신머리로도 계속 살아있기로 한게 극단적 선택이고",
      like: 47000, rt: 15000, views: 1203511, bm: 10000, detailTime: "오전 3:21", quotes: [] },
    { id: "t5", name: "ㄱㄹ", handle: "gr_tws_trade", age: "6시간", avatar: "",
      text: "투어스 멜론 포토카드 양도 받습니다\n>신유,도훈< 구해요\n가격 최대한 맞춰 드립니다\n연락주세요\nBUY⭕️⭕️",
      images: ["./tw-5-1.jpg"],
      like: 7, rt: 25, views: 2210, bm: 12, detailTime: "오전 2:15", quotes: [] },
    { id: "t6", name: "쿠..!!!", handle: "kuu_tws", age: "7시간", avatar: "./tw-av-6.jpg",
      text: "어!!!! 개존맛이야 인생을 차돌수육 못 먹은 게 헛 산 거 같고 걍 그럼.... 아니 진짜 꼭 먹어야 돼 돼픽은 믿고 가는 거임 그냥 묻지도 따지지도 말고 제발 먹어봐",
      spin: { q: "쿠야 신유 추천 차돌수육 어땠어 맛있어?", a: "" },
      like: 3102, rt: 432, views: 61207, bm: 55, detailTime: "오전 1:58", quotes: [] }
  ],
  // 인용 예시: quotes: [ { name: "닉네임", handle: "아이디", age: "1시간", avatar: "", text: "인용 내용" } ]
  // X 쪽지. time 이 시작 시각(TIME)보다 이르면 이미 와 있던 쪽지, 늦으면 게임 중에 차례로 도착해요
  DMS: [
    // { id: "d1", name: "user_1234", handle: "user_1234", time: "07:40", followers: 0, following: 1, posts: 0, msgs: ["쪽지 내용"] },
  ],
  // X 알림 (팔로우)
  NOTIS: [
    // { who: ["user_1", "user_2"], more: 5, time: "방금" },
  ],
  TRENDS: [],
  SEARCH_KEYWORD: "",
  X_FOLLOWERS: 0,

  // 유튜브 아이콘을 누르면 열리는 주소
  YOUTUBE_URL: "https://www.youtube.com",

  // 쪽지 도착 간격(밀리초), 인스타 팔로우 요청 알림 횟수
  DM_FIRST_DELAY: 4000,
  DM_GAP_MIN: 7000,
  DM_GAP_MAX: 15000,
  IG_REQ_POPS: 0
};
