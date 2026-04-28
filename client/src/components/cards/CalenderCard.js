// src/components/PayCalendar.jsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../../App";
import { getRecurringCalEvents } from "../../utils/API/recurring";
// import interactionPlugin from "@fullcalendar/interaction";
// import "./PayCalendar.css"; // optional for extra styles

export default function CalendarCard() {
  const { user, setUser, token } = useContext(userContext);
  const [events, setEvents] = useState([]);

  // TODO fix how calendar get recurring, should get all dates and predict future dates. Bonus: adhock predict dates on next button click on calander

  const getCalEvents = async (token) => {
    return await getRecurringCalEvents(token);
    // return await getAllRecurring(token);
  };

  useEffect(() => {
    if (!user || !token || !user.selected_account_id) return;
    getCalEvents(token).then((events) => {
      if (!events) return;
      setEvents(events);
    });
  }, [user]);

  // console.log(user.bills);
  return (
    <div className="window-style">
      <h3 className="style-text text-center text-opacity-75">
        Finance Calendar
      </h3>
      <div id="calendar" className="calendar">
        <FullCalendar
          key={events.length}
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          displayEventTime={false}
          displayEventEnd={false}
          height={"auto"}
          contentHeight={"auto"}
          fixedWeekCount={true}
          showNonCurrentDates={true}
          expandRows={true}
          headerToolbar={{
            left: "prev,next today",
            center: "",
            right: "title",
          }}
          dayCellClassNames={(arg) => (arg.isToday ? ["fc-today-custom"] : [])}
          dayCellDidMount={(arg) => {
            if (!events || Object.keys(events).length === 0) return;

            // console.log(arg.date);
            // console.log(events);
            const dayEvents = events.filter(
              (e) => e?.date === arg.date.toLocaleDateString("en-CA"),
            );
            // console.log(dayEvents);

            const hasPayday = dayEvents.some(
              (e) => e.extendedProps.type === "payment",
            );
            const hasBill = dayEvents.some(
              (e) => e.extendedProps.type === "bill",
            );

            if (hasPayday && hasBill) {
              arg.el.classList.add("day-mixed");
            } else if (hasPayday) {
              arg.el.classList.add("day-payday");
            } else if (hasBill) {
              console.log("im special");

              arg.el.classList.add("day-bill");
            }
          }}
        />
      </div>
    </div>
  );
}
