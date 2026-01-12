import { createRoot } from "react-dom/client";
import ArchiveWindow from "./ArchiveWindow";
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import moment from "moment";
import "react-calendar/dist/Calendar.css";
import "./App.css";
// import ArchiveWindow from "./ArchiveWindow";




//감정 아이콘
const MOOD_OPTIONS = [
  { id: "happy",emoji: "😄" },
  { id: "sad", emoji: "😢" },
  { id: "angry", emoji:"😡" },
  { id: "tired", emoji: "🥱" },
  { id: "surprised", emoji: "😲" },
  { id: "star", emoji: "🤩" },
  { id: "Nauseated", emoji: "🤢"},
  { id: "partying", emoji: "🥳"},
  { id: "shushing", emoji: "🤫"},
  { id: "sneezing", emoji:"🤧"},
  { id: "worried", emoji:"😟"},
  { id: "screamin", emoji:"😱"},
  { id: "spiral", emoji: "😵‍💫"},
  { id: "Expressionless ", emoji: "😑"}

];


function  App() {
  const [value, setValue] = useState(new Date());  
  const [openDate, setOpenDate] = useState(null); 

  const [moodMap, setMoodMap] = useState({});
  const [diaryMap, setDiaryMap] = useState({});
  

  const [text, setText] = useState("");

  const selectedDateString = moment(value).format("YYYY-MM-DD");


  const [archiveMap, setArchiveMap] = useState(() => {
    const main = localStorage.getItem("archiveMap");
    if (main) return JSON.parse(main);

  // ✅ 예전 오타 키에서 복구
  const typo = localStorage.getItem("achiveMap");
  if (typo) {
    localStorage.setItem("archiveMap", typo);
    localStorage.removeItme("achiveMap");
    return JSON.parse(typo);
  }
  return {};
});


  //백업
  useEffect(() => {
    try {
      localStorage.setItem("archiveMap", JSON.stringify(archiveMap));
    } catch (e) {
      console.error(e);
      alert("저장 공간이 부족해서 저장에 실패했어요. 사진 수를 줄이거나 용량을 비워주세요.");
    }
  }, [archiveMap]);

  // 추억앨범 오류 확인할것
  useEffect(() => {
    const onStorage = (e) => {
      if (e.storageArea !== localStorage) return;
      if (e.key !== "archiveMap") return;

      // removeItem 등으로 newValue가 null이면 빈 객체로
      if (e.newValue == null) {
        setArchiveMap({});
        return;
      }

      try {
        const next = JSON.parse(e.newValue);
        // 객체가 아닐 수도 있으니 방어
        if (next && typeof next === "object") setArchiveMap(next);
      } catch (err) {
        // ✅ 여기서 절대 {}로 덮어쓰지 말기!
        console.warn("archiveMap parse failed:", err);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  

  // 최초 로딩
  useEffect(() => {
    const storedMood = localStorage.getItem("calendarMood");
    const storedDiary = localStorage.getItem("calendarDiary");

    if (storedMood) setMoodMap(JSON.parse(storedMood));
    if (storedDiary) setDiaryMap(JSON.parse(storedDiary));
  }, []);

  useEffect(() => {
    localStorage.setItem("calendarMood", JSON.stringify(moodMap));
  }, [moodMap]);

  useEffect(() => {
    localStorage.setItem("calendarDiary", JSON.stringify(diaryMap));
  }, [diaryMap]);

  
  // 선택된 날짜 변경 시 일기 텍스트 갱신
  useEffect(() => {
    setText(diaryMap[selectedDateString] || "");
  }, [selectedDateString, diaryMap]);



  // 날짜 클릭 이벤트
  const handleDateChange = (date) => {
    setValue(date);

    const newDate = moment(date).format("YYYY-MM-DD");
    const sameDate = openDate === newDate;

    if (sameDate) {
      // 이미 열려있는 날짜 재클릭 → 닫기
      setOpenDate(null);
    } else {
      // 새로운 날짜 클릭 → 열기
      setOpenDate(newDate);
    }
  };

  // 기분 아이콘 선택하기
  const handleSelectMood = (moodId) => {
    setMoodMap((prev) => ({
      ...prev,
      [selectedDateString]: moodId,
    }));
  };

  // 일기 저장
  const handleSaveDiary = () => {
    setDiaryMap((prev) => {
      const newMap = { ...prev };
      const trimmed = text.trim();

      if (!trimmed) delete newMap[selectedDateString];
      else newMap[selectedDateString] = trimmed;

      return newMap;
    });
  };

  const getMoodEmoji = (moodId) => {
    const mood = MOOD_OPTIONS.find((m) => m.id === moodId);
    return mood ? mood.emoji : "";
  };


  //일기 + 감정 삭제
  const handleDeleteDiary = () => {
  if (!window.confirm("삭제할까요?")) return;

  setDiaryMap((prev) => {
    const newMap = { ...prev };  
    delete newMap[selectedDateString];
    return newMap;
  });

  setMoodMap((prev) => {
    const newMap = { ...prev };
    delete newMap[selectedDateString];
    return newMap;
  });

  setText(""); 
};

//todo-list
  
  // 모달: null | "todo" | "settings"
  const [modal, setModal] = useState(null);

  const [input, setInput] = useState("");

  const [todoMap, setTodoMap] = useState(() => {
    const saved = localStorage.getItem("todoMap");
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem("todoMap", JSON.stringify(todoMap));
  }, [todoMap]);

  const todayKey = moment().format("YYYY-MM-DD");
  const todayTodos = todoMap[todayKey] || [];

  const setTodosByKey = (key, nextTodos) =>
    setTodoMap((prev) => ({ ...prev, [key]: nextTodos }));

  const addTodoToToday = () => {
    const text = input.trim();
    if (!text) return;

    setTodosByKey(todayKey, [
      ...todayTodos,
      { id: Date.now(), text, done: false },
    ]);
    setInput("");
  };

  const toggleTodayTodo = (id) =>
    setTodosByKey(
      todayKey,
      todayTodos.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  const deleteTodayTodo = (id) =>
    setTodosByKey(todayKey, todayTodos.filter((t) => t.id !== id));


  // 오늘할일
  const openTodoWindow = () => {
  const win = window.open("", "todoWin", "width=420,height=700");
    if (!win) return alert("팝업이 차단됐어요! 팝업 허용해줘.");

    win.document.open();
    win.document.write(`<!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>todo-list</title>
      <style>
        body{font-family: SseulroneNetHandwrittenFont; margin:0; padding:16px; background:#fdfcf8; text-align:center;}
        h2{margin:0 0 12px; font-size:px;}
        .row{display:flex; gap:8px; margin-bottom:12px;}
        input{flex:1; height:40px; border-radius:12px; border:1px solid #ccc; padding:0 12px;}
        button{height:40px; border-radius:12px; border:none; padding:0 12px; cursor:pointer;}
        .add{background:#fff; color:#0000ff;}
        .del{background:#fff; color:#ff0000;}
        ul{list-style:none; padding:0; margin:0;}
        li{display:flex; justify-content:space-between; align-items:center; padding:10px 6px; border-bottom:1px solid #eee;}
        .left{display:flex; gap:10px; align-items:center;}
        .done{text-decoration:line-through; opacity:.5;}
      </style>
    </head>
    <body>
      <h2>To Do List 📌</h2>
      <div class="row">
        <input id="todoInput" placeholder="오늘 할 일을 입력하세요" />
        <button class="add" id="addBtn">추가</button>
      </div>
      <ul id="list"></ul>

      <script>
        const KEY = "todoMap";
        const todayKey = new Date().toISOString().slice(0,10);

        const loadMap = () => JSON.parse(localStorage.getItem(KEY) || "{}");
        const saveMap = (map) => localStorage.setItem(KEY, JSON.stringify(map));

        const getTodayList = () => {
          const map = loadMap();
          return map[todayKey] || [];
        };

        const setTodayList = (nextList) => {
          const map = loadMap();
          map[todayKey] = nextList;
          saveMap(map);
          render();
        };

        const render = () => {
          const listEl = document.getElementById("list");
          const list = getTodayList();
          listEl.innerHTML = "";

          if (list.length === 0) {
            listEl.innerHTML = "<li style='opacity:.6'>오늘 할 일이 없어요 🙂</li>";
            return;
          }

          list.forEach((t) => {
            const li = document.createElement("li");

            const left = document.createElement("div");
            left.className = "left";

            const cb = document.createElement("input");
            cb.type = "checkbox";
            cb.checked = !!t.done;
            cb.onchange = () => {
              const next = getTodayList().map(x => x.id === t.id ? {...x, done: !x.done} : x);
              setTodayList(next);
            };

            const span = document.createElement("span");
            span.textContent = t.text;
            if (t.done) span.className = "done";

            left.appendChild(cb);
            left.appendChild(span);

            const del = document.createElement("button");
            del.className = "del";
            del.textContent = "삭제";
            del.onclick = () => {
              const next = getTodayList().filter(x => x.id !== t.id);
              setTodayList(next);
            };

            li.appendChild(left);
            li.appendChild(del);
            listEl.appendChild(li);
          });
        };

        document.getElementById("addBtn").onclick = () => {
          const input = document.getElementById("todoInput");
          const text = input.value.trim();
          if (!text) return;

          const list = getTodayList();
          list.push({ id: Date.now(), text, done: false });
          setTodayList(list);
          input.value = "";
        };

        document.getElementById("todoInput").addEventListener("keydown", (e) => {
          if (e.key === "Enter") document.getElementById("addBtn").click();
        });

        // 다른 창(원래 앱)에서 todoMap 바뀌면 자동 반영
        window.addEventListener("storage", (e) => {
          if (e.key === KEY) render();
        });

        render();
      </script>
    </body>
    </html>`);
      win.document.close();
  };

  //아카이브 

  const openArchiveWindow = () => {
    const win = window.open("", "archive", "width=450,height=900");
    if (!win) return;

    win.document.title ="추억 아카이브";
    win.document.body.style.margin ="0";

    //렌더 전에 스타일 주입
    injectStylesTo(win);

    const container = win.document.createElement("div");
    win.document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <ArchiveWindow
        archiveMap={archiveMap}
        setArchiveMap={setArchiveMap}
      />
    );
 };

 function injectStylesTo(win) {
  // 외부 스타일시트 복사
  document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const newLink = win.document.createElement("link");
    newLink.rel = "stylesheet";
    newLink.href = link.href;
    win.document.head.appendChild(newLink);
  });

  // CRA/Vite가 주입한 style 태그 복사 (텍스트로 넣는 게 안정적)
  document.querySelectorAll("style").forEach((styleTag) => {
    const newStyle = win.document.createElement("style");
    newStyle.textContent = styleTag.textContent;
    win.document.head.appendChild(newStyle);
  });
}





  return (

    <div className="app">
      {/* todo-list */}
      <button className="icon-btn" onClick={openTodoWindow}>📒</button>
      <button className="icon-btn" onClick={openArchiveWindow}>🎞️</button>
      
      {/* 캘린더*/}
      <div className="calendar-wrap">
        <Calendar
          onChange={handleDateChange}
          value={value}
          formatDay={(locale, date) => { 
            const key = moment(date).format("YYYY-MM-DD");
            return moodMap[key] ? "" : moment(date).format("D"); // 감정 있으면 날짜 숨기기
          }}
          tileContent={({ date }) => {
            const key = moment(date).format("YYYY-MM-DD");
            const moodId = moodMap[key];
            const emoji = getMoodEmoji(moodId);

            if (!emoji) return null;

            return (
              <div className="mood-circle mood-has-emoji">
                <span className="mood-emoji">{emoji}</span>
              </div>
            );
          }}
        />
      </div>

   
      {/* 선택된 날짜 패널 */}
      {openDate && (
        <div className="panel">
                  {/* 기분선택 */}
          <div className="mood-buttons">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.id}
                type="button"
                onClick={() => handleSelectMood(mood.id)}
                className={
                  "mood-btn" +
                  (moodMap[selectedDateString] === mood.id
                    ? " mood-btn-active"
                    : "")
                }
              >
                <span className="mood-btn-emoji">{mood.emoji}</span>
                <span>{mood.label}</span>
              </button>
            ))}

          </div>

          {/* 일기 작성 */}
          <textarea
            className="diary-textarea"
            placeholder="오늘은 어떤 하루였나요?"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="action_buttons">
            <button className="save-btn" onClick={handleSaveDiary}>저장</button>
            <button className="delete-btn" onClick={handleDeleteDiary}>삭제</button>
          </div>
        </div>
        // panel
      )}
    </div>
    // app
  );
}


// 오늘 할일

function TodoWindow({ todayKey, todoMap, setTodoMap }) {
  const [input, setInput] = useState("");
  const todos = todoMap[todayKey] || [];

  useEffect(() => {
    localStorage.setItem("todoMap", JSON.stringify(todoMap));
  }, [todoMap]);

  const setTodos = (next) =>
    setTodoMap((prev) => ({ ...prev, [todayKey]: next }));

  const add = () => {
    const t = input.trim();
    if (!t) return;
    setTodos([...todos, { id: Date.now(), text: t, done: false }]);
    setInput("");
  };

  const toggle = (id) =>
    setTodos(todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));

  const del = (id) => setTodos(todos.filter((x) => x.id !== id));





  return (
    <div className="todo-win">
      <div className="todo-win-head">
        <div>
          <div className="todo-win-title">오늘 할 일</div>
          <div className="todo-win-date">{todayKey}</div>
        </div>
      </div>

      <div className="todo-form">
        <input
          className="todo-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="할 일을 입력하세요"
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button className="btn primary" onClick={add}>추가</button>
      </div>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="todo-empty">오늘 할 일이 없어요 🙂</li>
        ) : (
          todos.map((t) => (
            <li key={t.id} className={`todo-item ${t.done ? "done" : ""}`}>
              <label className="todo-left">
                <input type="checkbox" checked={t.done} onChange={() => toggle(t.id)} />
                <span className="todo-text">{t.text}</span>
              </label>
              <button className="btn danger" onClick={() => del(t.id)}>삭제</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}



export default App;  