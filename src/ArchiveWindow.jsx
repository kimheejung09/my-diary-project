import React, { useMemo, useState, useEffect, useRef } from "react";
import "./ArchiveWindow.css";

const toMonth = (dateStr) => dateStr.slice(0, 7);

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function monthToKR(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return `${y}년 ${Number(m)}월`;
}

export default function ArchiveWindow({ archiveMap, setArchiveMap }) {
  const today = todayStr();

  // 선택된 날짜 (카드 클릭 시)
  const [selectedDate, setSelectedDate] = useState("");

  // 편집 상태
  const [dateInput, setDateInput] = useState("");
  const [lineInput, setLineInput] = useState("");
  const [memoInput, setMemoInput] = useState("");
  const [photos, setPhotos] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const galleryRef = useRef(null);
  const cameraRef = useRef(null);

  // 기록 리스트 (오래된→최신 순으로 정렬하려면 sort().reverse(), 최신→오래된면 sort().reverse() 사용)
  const records = useMemo(() => {
    const dates = Object.keys(archiveMap || {}).sort(); // 오름차순(오래된→최신)
    return dates.map((date) => ({ date, ...(archiveMap?.[date] || {}) }));
  }, [archiveMap]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const r of records) {
      const ym = toMonth(r.date);
      if (!map.has(ym)) map.set(ym, []);
      map.get(ym).push(r);
    }
    // 최신 월이 위로 오게
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [records]);

  // 카드 선택 시 편집 패널에 로드
  const openCard = (date) => {
    setIsEditing(true);
    setSelectedDate(date);

    const item = archiveMap?.[date] || {
      line: "",
      memo: "",
      photos: [],
    };

    setDateInput(date);
    setLineInput(item.line || "");
    setMemoInput(item.memo || "");
    setPhotos(Array.isArray(item.photos) ? item.photos : []);
  };

  // 처음 열릴 때 오늘 날짜가 있으면 자동 선택
  useEffect(() => {
    if (!selectedDate && archiveMap?.[today]) openCard(today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ 파일 압축 (base64)
  const fileToCompressedDataURL = (file, maxSize = 900, quality = 0.75) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.onload = () => {
          const { width, height } = img;
          const scale = Math.min(1, maxSize / Math.max(width, height));
          const w = Math.round(width * scale);
          const h = Math.round(height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);

          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = reader.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const readFilesToBase64 = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    try {
      const dataUrls = [];
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        const url = await fileToCompressedDataURL(f, 900, 0.75);
        dataUrls.push(url);
      }
      setPhotos((prev) => [...prev, ...dataUrls]);
    } catch (e) {
      console.error(e);
      alert("사진 처리 중 오류가 났어요.");
    }
  };

  const onPickGalleryFiles = async (e) => {
    await readFilesToBase64(e.target.files);
    e.target.value = "";
  };

  const onPickCameraFiles = async (e) => {
    await readFilesToBase64(e.target.files);
    e.target.value = "";
  };

  // 저장
  const save = () => {
    const d = (dateInput || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return alert("날짜 형식은 YYYY-MM-DD");

    setArchiveMap((prev) => {
      const next = { ...(prev || {}) };
      next[d] = {
        ...(next[d] || {}),
        line: (lineInput || "").trim(),
        memo: (memoInput || "").trim(),
        photos: Array.isArray(photos) ? photos : [],
      };
      return next;
    });

    // 저장 후 닫고 목록으로 가고 싶으면 ↓
    setIsEditing(false);
    setSelectedDate("");
    setDateInput("");
    setLineInput("");
    setMemoInput("");
    setPhotos([]);
  };

  // 편집 패널에서 삭제
  const remove = () => {
    const d = (dateInput || "").trim();
    if (!d) return;

    const ok = window.confirm(`${d} 기록을 삭제할까요?`);
    if (!ok) return;

    setArchiveMap((prev) => {
      const next = { ...(prev || {}) };
      delete next[d];
      return next;
    });

    setIsEditing(false);
    setSelectedDate("");
    setDateInput("");
    setLineInput("");
    setMemoInput("");
    setPhotos([]);
  };

  // 목록에서 삭제
  const removeFromList = (e, date) => {
    e.preventDefault();
    e.stopPropagation();

    // 더블클릭, 연타 방지
    if (!date) return;

    const ok = window.confirm(`${date} 기록을 삭제할까요?`);
    if (!ok) return;


    if (selectedDate === date) {
    closeEditor();
    }

    setArchiveMap((prev) => {
      const next = { ...(prev || {}) };
      delete next[date];
      return next;
    });

    if (selectedDate === date) {
      setIsEditing(false);
      setSelectedDate("");
      setDateInput("");
      setLineInput("");
      setMemoInput("");
      setPhotos([]);
    }
  };

  // 새로 만들기
  const createNew = () => {
    setIsEditing(true);
    setSelectedDate("");
    setDateInput(today);
    setLineInput("");
    setMemoInput("");
    setPhotos([]);
  };

  const closeEditor = () => {
    setIsEditing(false);
    setSelectedDate("");
    setDateInput("");
    setLineInput("");
    setMemoInput("");
    setPhotos([]);
  };

  return (
    <div className="bookWrap">
      {/* ⬅️ 왼쪽 : 항상 보이는 목록 */}
      <div className="bookLeft">
        <div className="leftTop">
          <div className="bookTitle">오늘의 하루를 사진으로 남겨봐!</div>

          <button className="newBtn" onClick={createNew} type="button">
            +
          </button>
        </div>

        {/* 월별 / 카드 그리드 */}
        {grouped.map(([ym, list]) => (
          <section key={ym} className="monthSection">
            <div className="monthHeader">{monthToKR(ym)}</div>

            <div className="photoGrid">
              {list.map((r) => (
                <button
                  key={r.date}
                  type="button"
                  tabIndex={0}
                  className={"photoCardBtn" + (selectedDate === r.date ? " selected" : "")}
                  onClick={() => openCard(r.date)}
                >


                  <span
                    className="delMiniBtn"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => removeFromList(e, r.date)}
                    onKeyDown={(e) => e.key === "Enter" && removeFromList(e, r.date)}
                    aria-label="삭제"
                  >
                    ×
                  </span>

                  <div className="photoArea">
                    {r.photos?.[0] ? (
                      <img className="photoImg" src={r.photos[0]} alt="" />
                    ) : (
                      <div className="photoEmpty">사진 없음</div>
                    )}
                  </div>

                  <div className="lineArea">
                    <div className="lineRow">
                      <div className="lineText">{r.line || ""}</div>
                      <div className="memoPreview">{r.memo || ""}</div>
                    </div>

                    <div className="dateBadge">
                      {r.date ? r.date.replaceAll("-", ".") : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* ➡️ 오른쪽 : 편집 중일 때만 */}
      {isEditing && (
        <div className="bookRight">
          <div className="rightTop">
            <button className="closeBtn" onClick={closeEditor} type="button">
              ✕
            </button>
          </div>

          <input
            className="input"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            placeholder="YYYY-MM-DD"
          />

          <div className="actionsRow">
            <button type="button" onClick={() => galleryRef.current?.click()}>
              🖼️ 앨범
            </button>
            <button type="button" onClick={() => cameraRef.current?.click()}>
              📷 카메라
            </button>
          </div>

          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onPickGalleryFiles}
            style={{ display: "none" }}
          />

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={onPickCameraFiles}
            style={{ display: "none" }}
          />

          <label className="label">제목</label>
          <input className="input" value={lineInput} onChange={(e) => setLineInput(e.target.value)} />

          <label className="label">메모</label>
          <textarea className="textarea" value={memoInput} onChange={(e) => setMemoInput(e.target.value)} />

          <div className="btnRow">
            <button className="saveBtn" onClick={save} type="button">
              저장
            </button>
            <button className="delBtn" onClick={remove} type="button">
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
