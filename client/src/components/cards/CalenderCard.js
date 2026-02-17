// src/components/PayCalendar.jsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useContext } from "react";
import { userContext } from "../../App";
// import interactionPlugin from "@fullcalendar/interaction";
// import "./PayCalendar.css"; // optional for extra styles

export default function CalendarCard({ events }) {
  const { user, setUser } = useContext(userContext);
  console.log(user);
  return (
    <div className="info-text calendar bg-gradient rounded border border-secondary p-3">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height={"auto"}
        contentHeight={"auto"}
        fixedWeekCount={true}
        showNonCurrentDates={true}
        expandRows={true}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        // events={events}
        // eventContent={(arg) => (
        //   <div
        //     className={`fc-event-content ${
        //       arg.event.extendedProps.predicted ? "predicted" : ""
        //     }`}
        //   >
        //     <b>{arg.event.title}</b>
        //     <span> ${arg.event.extendedProps.amount}</span>
        //   </div>
        // )}
        // eventClassNames={(arg) => [arg.event.extendedProps.type]} // type-based class for CSS
        // height="auto"
      />
    </div>
  );
}
