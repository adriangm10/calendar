import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
    const [date, setDate] = useState(new Date());
    date.setDate(1);
    const today = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const [showMonthNames, setShowMonths] = useState(false);
    const [selected_day, setSelected_day] = useState(date.getDate());
    const [create_event, setCreate_event] = useState(false);
    const [ev_msg, setEv_msg] = useState("");
    const [ev_return, setEv_return] = useState("");
    const [rmLbl, setRmLbl] = useState("");
    const [show_events, setShowEvents] = useState(false);
    const [month_events, setMonthEvents] = useState([]);

    async function monthEvents() {
        setMonthEvents(await invoke("month_events", {
            year: date.getFullYear(),
            month: date.getMonth(),
        }));
    }

    useEffect(() => {monthEvents();}, []);

    function containsEvent(year, day){
        for(let i = 0; i < month_events.length; i++){
            if(month_events[i].day === day && month_events[i].year === year) return true;
        }
        return false;
    }

    /// evs: array of the positions of the events in the array month_events
    async function removeEvents(evs) {
        for(let i = 0; i < evs.length; i++){
            setRmLbl(await invoke("remove_todo", {
                year: month_events[evs[i]].year,
                month: month_events[evs[i]].month,
                day: month_events[evs[i]].day,
                msg: month_events[evs[i]].msg,
            }));
        }
        monthEvents();
    }

    async function markFinished(evs) {
        for(let i = 0; i < evs.length; i++){
            setRmLbl(await invoke("mark_finished", {
                year: month_events[evs[i]].year,
                month: month_events[evs[i]].month,
                day: month_events[evs[i]].day,
                msg: month_events[evs[i]].msg,
            }));
        }
        monthEvents();
    }

    function DayTodos(){
        const day_events = [];
        const state = {
            button: 1
        };

        for(let i = 0; i < month_events.length; i++){
            if(parseInt(month_events[i].day) === selected_day){
                if(!month_events[i].finished)
                    day_events.push(
                        <label className="event-container">
                        {month_events[i].msg}
                        <input type="checkbox" id={i} value={i} className="event" />
                        <span className="checkmark"></span>
                        </label>
                    );
                else
                    day_events.push(
                        <label className="event-container">
                        <s>{month_events[i].msg}</s>
                        <input type="checkbox" id={i} value={i} className="event" />
                        <span className="checkmark"></span>
                        </label>
                    );
            }
        }

        return(
            <form onSubmit={e => {
                e.preventDefault();
                let elems = e.currentTarget.getElementsByClassName("event");
                let selectedEvs = [];

                for(let i = 0; i < elems.length; i++){
                    if(elems[i].checked) selectedEvs.push(elems[i].value);
                }

                if(state.button === 1) removeEvents(selectedEvs);
                else if(state.button === 2) markFinished(selectedEvs);
            }}>
            <button className="trash" onClick={() => state.button = 1} name="trash" value="1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/> <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/> </svg>
            </button>
            <button className="check" onClick={() => state.button = 2} name="check" value="2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16"> <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/> </svg>
            </button><br/>
            {day_events}
            </form>
        );
    }

    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    async function newEvent(){
        if(ev_msg.length == 0){
            setEv_return("The event has no text");
            return;
        }
        setEv_return(await invoke("write_todo", {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: selected_day,
            msg: ev_msg
        }).catch((e) => {return e.toString();}));
    }

    function Square({value, name}){
        return(
            <button key={value} className={name} onClick={
                () => {
                    setSelected_day(parseInt(value));
                    setShowEvents(true);
                }}>
                {value}
            </button>
        );
    }

    function Month(){
        const days = daysInMonth(date.getFullYear(), date.getMonth());
        let monthDays = [];
        let first_day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        let day_name = "day";

        if(first_day === 0) first_day = 6;
        else first_day--;

        for(let i = 0; i < weekDays.length; i++){
            monthDays.push(<div className="grid-item" style={{fontSize: 14}}>{weekDays[i]}</div>);
        }
        for(let i = 0; i < first_day; i++){
            monthDays.push(<div className="grid-item"></div>);
        }

        for(let day = 1; day <= days; day++){
            if(day === today.getDate() && today.getMonth() === date.getMonth() && today.getFullYear() === date.getFullYear())
                day_name = "today";
            // else if(day === selected_day) day_name = "selected-day";
            else if(containsEvent(date.getFullYear(), day)) day_name = "has-event";
            else day_name = "day";

            monthDays.push(<Square value={day} name={day_name} />);
        }

        return(
            <div className="month-container">
            {monthDays}
            </div>
        );
    }

    function prevMonth(){
        date.setMonth(date.getMonth() - 1);
        monthEvents();
    }

    function nextMonth(){
        date.setMonth(date.getMonth() + 1);
        monthEvents();
    }

    if(show_events){
        return(
            <>
            <div className="header">
            <button onClick={() => {setShowEvents(false); setRmLbl("");}} className="arrow">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/> </svg>
            </button>
            <p1 style={{paddingLeft: "95px"}}>Events for day {selected_day}</p1>
            </div>
            <DayTodos />
            <button onClick={() => {setCreate_event(true); setShowEvents(false); setRmLbl("");}}>New event</button>
            <p>{rmLbl}</p>
            </>
        );
    }

    if(create_event){
        return(
            <>
            <button className="arrow" onClick={() => {
                setCreate_event(false);
                setShowEvents(true);
                setEv_return("");
                monthEvents();
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"/> </svg>
            </button>
            <form onSubmit={(e) => {
                e.preventDefault();
                newEvent();
                e.currentTarget.reset();
                setEv_msg("");
                monthEvents();
            }} >
            <input className="text" onChange={(e) => setEv_msg(e.currentTarget.value)} placeholder="Enter event description" />
            <button>create event</button>
            </form>
            <p>{ev_return}</p>
            </>
        );
    }

    if(showMonthNames){
        return(
            <div className="month-names">
            {months.map((month, i) => 
                <button key={i} onClick={
                    () => {
                        setShowMonths(false);
                        date.setMonth(i);
                        monthEvents();
                    }
                }>
                {month}
                </button>
            )}
            </div>
        );
    }

    return(
        <>
        <div className="header">
        <button className="month" onClick={() => {
            //setSelected_day(0);
            setShowMonths(true);
        }}>{months[date.getMonth()].concat(" ", date.getFullYear().toString())}</button>
        <button className="arrow" onClick={() => {
            prevMonth();
            //setSelected_day(0);
        }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
        <button className="arrow" onClick={() => {
            nextMonth();
            //setSelected_day(0);
        }}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
        </div>
        <Month />
        </>
    );
    // <h1>{weekDays[today.getDay()].concat(", ", months[today.getMonth()], " ", today.getDate(), ", ", today.getFullYear())}</h1>
}

export default App;
