/* 인스타그램 내용 (여기만 고치면 돼요. config.js 와 따로라서 실수해도 사이트가 안 멈춰요)
   - 멘트 안에 큰따옴표(")는 쓰지 마세요. 줄바꿈 없이 한 줄로 써주세요.
   - kind: "mention"=스토리 태그(만료) / "share"=스토리 공유 / "story"=스토리 답장(만료)
     kind 없이 text 만 있으면 일반 대화 말풍선, from: "them"=상대 / "me"=나
   - share + story: 2 → 보관함 2번째 사진을 보여줘요 */
window.INSTA_CONFIG = {
  bio: "",
  posts: [
    // { img: "./ig-post-1.jpg", date: "2026-08-15", likes: 1, caption: "게시물 멘트",
    //   comments: [{ user: "아이디", text: "댓글", time: "10주" }] },
  ],
  // 인스타 좋아요를 처음 누르면 트위터 쪽지로 오는 메시지 (안 쓰면 비워두세요)
  likeDm: { handle: "", msgs: [] },
  // 팔로우 요청 목록
  requests: [],
  // 스토리 보관함 (날짜 순서대로)
  stories: [
    // { date: "2026-02-14", img: "./ig-story-1.jpg" },
  ],
  dm: {
    user: "",
    msgs: [
      // { d: "2026-10-06", t: "08:30", from: "them", text: "대화 내용" },
    ]
  }
};
