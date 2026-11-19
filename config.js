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

  // X(트위터) 피드
  TWEETS: [
    // { id: "t1", name: "닉네임", handle: "handle", age: "1시간", avatar: "", text: "트윗 내용 {NAME}",
    //   images: ["./tw-1.jpg"], like: 120, rt: 30, views: 5000, bm: 10, detailTime: "오전 7:12", replies: [] },
  ],
  // X 쪽지. time 이 시작 시각(TIME)보다 이르면 이미 와 있던 쪽지, 늦으면 게임 중에 차례로 도착해요
  DMS: [
    // { id: "d1", name: "user_1234", handle: "user_1234", time: "07:40", followers: 0, following: 1, posts: 0, msgs: ["쪽지 내용"] },
  ],
  // X 알림 (팔로우)
  NOTIS: [
    // { who: ["user_1", "user_2"], more: 5, time: "방금" },
  ],
  QUOTES: [],
  REPOSTS: [],
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
