import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
    const [date, setDate] = useState(new Date());
    const today = new Date();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function Square({value, name}){
        return(
            <button className={name}>
                {value}
            </button>
        );
    }

    function Month(){
        const days = daysInMonth(date.getFullYear(), date.getMonth());
        // const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        let monthDays = [];
        let first_day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        let day_name = "day";
        if(first_day === 0) first_day = 6;
        else first_day--;

        for(let i = 0; i < first_day; i++){
            monthDays.push(<div className="grid-item"></div>);
        }

        for(let day = 1; day <= days; day++){
            if(day === date.getDate() && today.getMonth() === date.getMonth())
                day_name = "today";
            else day_name = "day";

            monthDays.push(<Square value={day} name={day_name} />);
        }

        return(
            <div className="grid-container">
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

    return(
        <>
        <div className="header">
        <label htmlFor="arrow" className="month">{months[date.getMonth()]}</label>
        <button className="arrow" onClick={prevMonth}></button>
        <button className="arrow" onClick={nextMonth}></button>
        </div>
        <Month />
        <h1>{today.toDateString()}</h1>
        </>
    );
}

export default App;
