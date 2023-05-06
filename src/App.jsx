import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
    const [date, setDate] = useState(new Date());
    const today = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // const weekDays = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const [show_months, setShow_months] = useState(false);
    const [selected_day, setSelected_day] = useState(date.getDate());
    const [create_event, setCreate_event] = useState(false);
    const [ev_msg, setEv_msg] = useState("");
    const [ev_return, setEv_return] = useState("");

    async function get_month_events(){
        return await invoke("month_events", {
            year: date.getFullYear(),
            month: date.getMonth(),
        }).then((evs) => {return evs;}).catch(() => {return [];});
    }

    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function changeDay(day){
        setSelected_day(day);
    }

    async function newEvent(){
        setEv_return(await invoke("write_todo", {
            year: date.getFullYear(),
            month: date.getMonth(),
            day: selected_day,
            msg: ev_msg
        }).then(() => { return "the event was succesfully created"; }).catch((e) => {return e.toString();}));
    }

    function DayTodos(){
        const [day_events, setDayEvents] = useState([]);

        get_month_events().then((month_events) => {
            const day_events = [];
            for(let i = 0; i < month_events.length; i++){
                if(parseInt(month_events[i].day) === selected_day){
                    day_events.push(<p>{month_events[i].msg}</p>);
                }
            }
            setDayEvents(day_events);
        });

        return(
            <>
            {day_events}
            <button onClick={() => {setCreate_event(true);}}>New event</button>
            </>
        );
    }

    function Square({value, name}){
        return(
            <button key={value} className={name} onClick={() => changeDay(parseInt(value))}>
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
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, date.getDate()));
    }

    function nextMonth(){
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, date.getDate()));
    }

    if(create_event){
        return(
            <>
            <form onSubmit={(e) => {
                e.preventDefault();
                newEvent();
                e.currentTarget.reset()
            }} >
            <input onChange={(e) => setEv_msg(e.currentTarget.value)} placeholder="Enter the event message" />
            <button>create event</button>
            </form>
            <button onClick={() => {
                setCreate_event(false);
                setEv_return("");
            }}>back</button>
            <p>{ev_return}</p>
            </>
        );
    }

    if(show_months){
        return(
            <div className="month-names">
            {months.map((month, i) => 
                <button key={i} onClick={
                    () => {
                        setShow_months(false);
                        date.setMonth(i);
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
        <button className="month" onClick={() => setShow_months(true)}>{months[date.getMonth()].concat(" ", date.getFullYear().toString())}</button>
        <button className="arrow" onClick={prevMonth}></button>
        <button className="arrow" onClick={nextMonth}></button>
        </div>
        <Month />
        <DayTodos />
        </>
    );
    // <h1>{weekDays[today.getDay()].concat(", ", months[today.getMonth()], " ", today.getDate(), ", ", today.getFullYear())}</h1>
}

export default App;
