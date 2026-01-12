import React, {useState, useEffect} from "react";
import moment  from "moment";
import "./TodoPage.css";
import { createRoot } from "react-dom/client";


function Todopage(){
    const todayKey = moment().format("YYYY-MM-DD");

    const [input, setInput] = useState("");
    const [todoMap, setTodoMap]  = useState(() => {
        const saved = localStorage.getItem("todoMap");
        return saved ? JSON.parse(saved) : {};
    });

    const todos = todoMap[todayKey] || [];

    useEffect(() => {
        localStorage.setItem("godoMap", JSON.stringify(todoMap));
    }, [todoMap]);

    const setTodos =(next) =>
        setTodoMap((prev) => ({ ...prev, [todayKey]: next}));

    const addTodo = () => {
        const t = input.trim();
        if(!t) return;
        setTodos([...todos, {id: Date.now(), text : t, done: false}]);
        setInput("");

    };
    const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

    const deleteTodo = (id) =>
    setTodos(todos.filter((t) => t.id !== id));



    return(
        <div className="todo-page">
            <h1 className="todo-title">오늘 할 일</h1>

            <div className="todo-rorm">
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="오늘 할 일을 입력하세요"
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                />
                <button onClick={addTodo}>추가</button>
            </div>


            <ul className="todo-list">
                {todos.length === 0 ? (
                    <li className="empty">오늘 할 일이 없어요 🙂</li>
                ) : (
                    todos.map((t) => (
                        <li key={t.id} className={t.done ? "done" : ""}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={t.done}
                                    onChange={() => toggleTodo(t.id)}
                                />
                                <span>{t.text}</span>
                            </label>
                            <button onClick={() => deleteTodo(t.id)}>삭제</button>
                        </li>
                    ))
                )}
            </ul>
        </div>

    )

};


export default Todopage;