// src/components/PayCalendar.jsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../../App";
// import interactionPlugin from "@fullcalendar/interaction";
// import "./PayCalendar.css"; // optional for extra styles

export default function CalendarCard() {
  const { user, setUser } = useContext(userContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!user) return;

    const paydays =
      user.income?.map((i) => ({
        title: /* i.name */ `+$${Number(i.amount).toLocaleString()}`,
        date: i.predicted_next_pay.split("T")[0],
        extendedProps: {
          type: "payday",
          amount: i.amount,
        },
      })) ?? [];

    const bills =
      user.bills?.map((b) => ({
        title: /* b.name */ `-$${Number(b.amount).toLocaleString()}`,
        date: b.next_due.split("T")[0],
        extendedProps: {
          type: "bill",
          amount: b.amount,
        },
      })) ?? [];

    setEvents([...paydays, ...bills]);
  }, [user]);

  // console.log(user.bills);
  return (
    <div className="bg-gradient rounded border border-secondary p-3">
      <h3 className="text-center text-light text-opacity-75">
        Finance Calendar
      </h3>
      <div className="calendar info-text">
        <FullCalendar
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
            console.log(arg.date);
            const dayEvents = events.filter(
              (e) =>
                e.date.split("T")[0] === arg.date.toLocaleDateString("en-CA"),
            );
            // console.log(dayEvents);

            const hasPayday = dayEvents.some(
              (e) => e.extendedProps.type === "payday",
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
