// src/components/PayCalendar.jsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
// import interactionPlugin from "@fullcalendar/interaction";
// import "./PayCalendar.css"; // optional for extra styles

export default function CalendarCard({ events }) {
  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        events={events}
        eventContent={(arg) => (
          <div
            className={`fc-event-content ${
              arg.event.extendedProps.predicted ? "predicted" : ""
            }`}
          >
            <b>{arg.event.title}</b>
            <span> ${arg.event.extendedProps.amount}</span>
          </div>
        )}
        eventClassNames={(arg) => [arg.event.extendedProps.type]} // type-based class for CSS
        height="auto"
      />
    </div>
  );
}
