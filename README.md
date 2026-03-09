📖 하루의 감정과 일기를 기록하고 확인할 수 있는 React 기반 다이어리 웹 애플리케이션입니다.
캘린더를 통해 날짜별로 기록을 관리하고 감정 통계를 확인할 수 있습니다.

🔗 Live Demo 배포 링크 : https://kimheejung09.github.io/my-diary-project/

🛠 기술 스택

- React
- JavaScript (ES6+)
- CSS
- React Router
- React Hooks (useState, useEffect)
- React Calendar
- Moment.js

✨ 주요 기능

- 캘린더 기반 일기 관리
- 감정 선택 기능
- 일기 작성 / 수정 / 삭제
- 감정 통계 확인
- 모바일 반응형 UI

💡 구현 포인트

캘린더 기반 날짜 관리

- `react-calendar` 라이브러리를 활용하여 날짜 선택 UI 구현
- 선택된 날짜 기준으로 해당 일기 데이터 표시

감정 데이터 처리

- 감정 점수를 기반으로 **좋음 / 보통 / 나쁨** 상태 구분
- 감정 데이터를 기반으로 통계 표시

React Router를 활용한 페이지 구조

- `React Router`를 사용하여 페이지 이동 구현
- Home / New / Edit 페이지 구조 설계

컴포넌트 분리 설계

- DiaryItem
- EmotionItem
- Header

- 재사용성과 유지보수성을 고려한 구조 설계


🛠 문제 해결

GitHub Pages 배포 경로 문제

- React Router 사용 시 페이지 새로고침 시 오류 발생
- `homepage` 설정 및 `gh-pages` 패키지를 사용하여 배포 해결

모바일 화면 레이아웃 문제

- 일부 화면이 잘리는 문제 발생
- `max-width`와 `margin: 0 auto`를 활용해 모바일 중앙 정렬 구조로 수정

캘린더 UI width 문제

- `react-calendar` 컴포넌트 width가 부모를 초과하는 문제
- CSS width 조정으로 해결
