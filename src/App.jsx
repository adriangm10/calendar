import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
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

    function Month({date}){
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
            if(day === date.getDate())
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

    const [date, setDate] = useState(new Date());

    return(
        <>
        <button className="arrow"></button>
        <button className="arrow"></button>
        <Month date={date} />
        </>
    );
}

export default App;
