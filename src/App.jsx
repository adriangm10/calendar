import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
    const [date, setDate] = useState(new Date());
    const today = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // const weekDays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [showMonthNames, setShowMonths] = useState(false);
    const [selected_day, setSelected_day] = useState(date.getDate());
    const [create_event, setCreate_event] = useState(false);
    const [ev_msg, setEv_msg] = useState("");
    const [ev_return, setEv_return] = useState("");
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

    function DayTodos(){
        const day_events = [];
        for(let i = 0; i < month_events.length; i++){
            if(parseInt(month_events[i].day) === selected_day){
                day_events.push(<li>{month_events[i].msg}</li>);
            }
        }

        return(
            <ul>
            {day_events}
            </ul>
        );
    }

    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    async function newEvent(){
        setEv_return(await invoke("write_todo", {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: selected_day,
            msg: ev_msg
        }).then(() => { return "the event was succesfully created"; }).catch((e) => {return e.toString();}));
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
            <h1>Events for day {selected_day}</h1>
            <DayTodos />
            <button onClick={() => setShowEvents(false)}>back</button>
            <button onClick={() => {setCreate_event(true); setShowEvents(false);}}>New event</button>
            </>
        );
    }

    if(create_event){
        return(
            <>
            <form onSubmit={(e) => {
                e.preventDefault();
                newEvent();
                e.currentTarget.reset();
            }} >
            <input onChange={(e) => setEv_msg(e.currentTarget.value)} placeholder="Enter the event description" />
            <button>create event</button>
            </form>
            <button onClick={() => {
                setCreate_event(false);
                setShowEvents(true);
                setEv_return("");
                monthEvents();
            }}>back</button>
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
