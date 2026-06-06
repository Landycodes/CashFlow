// src/components/PayCalendar.jsx
import "./CalenderCard.css";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../../../App";
import { getRecurringCalEvents } from "../../../utils/API/recurring";
// import interactionPlugin from "@fullcalendar/interaction";
// import "./PayCalendar.css"; // optional for extra styles

export default function CalendarCard() {
  const { user, setUser, token } = useContext(userContext);
  const [events, setEvents] = useState([]);

  // TODO fix how calendar get recurring, should get all dates and predict future dates. Bonus: adhock predict dates on next button click on calander

  // PULL FROM TRANSACTIONS INSTEAD! ADD A BOOLEAN COLUMN FOR IF ITS RECURRING OR NOT. AND IF IT IS SHUV THAT BITCH INTO THE CALENDAR
  //  HAVE THE ARROW KEY ON THE CALENDAR HAVE A FUNCTION THAT PREDICTS THE PAYMENTS FOR MONTH GOING TO AND SHUV IT IN

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
            left: "prev next today",
            center: "",
            right: "title",
          }}
          dayCellClassNames={(arg) => (arg.isToday ? ["fc-today-custom"] : [])}
          // dayCellDidMount={(arg) => {
          //   if (!events || Object.keys(events).length === 0) return;

          //   // console.log(arg.date);
          //   // console.log(events);
          //   const dayEvents = events.filter(
          //     (e) => e?.date === arg.date.toLocaleDateString("en-CA"),
          //   );
          //   // console.log(dayEvents);

          //   const hasPayday = dayEvents.some(
          //     (e) => e.extendedProps.type === "payment",
          //   );
          //   const hasBill = dayEvents.some(
          //     (e) => e.extendedProps.type === "bill",
          //   );

          //   if (hasPayday && hasBill) {
          //     arg.el.classList.add("day-mixed");
          //   } else if (hasPayday) {
          //     arg.el.classList.add("day-payday");
          //   } else if (hasBill) {
          //     console.log("im special");

          //     arg.el.classList.add("day-bill");
          //   }
          // }}
          eventDidMount={(arg) => {
            const type = arg.event.extendedProps.type;

            if (type === "payment") {
              arg.el.style.setProperty(
                "--fc-event-bg-color",
                "rgba(0, 190, 9, 0.35)",
              );
              arg.el.style.setProperty(
                "--fc-event-border-color",
                "transparent",
              );
            } else if (type === "bill") {
              arg.el.style.setProperty(
                "--fc-event-bg-color",
                "rgba(200, 0, 0, 0.25)",
              );
              arg.el.style.setProperty(
                "--fc-event-border-color",
                "transparent",
              );
            }
          }}
          eventMouseEnter={(arg) => {
            const tooltip = document.createElement("div");
            tooltip.className = "fc-tooltip";
            tooltip.id = "fc-tooltip";
            tooltip.innerHTML = `
             <div><strong>${arg.event.extendedProps.name}</strong></div>
             <div>Amount: ${arg.event.title}</div>
             <div>Type: ${arg.event.extendedProps.type}</div>
             `;
            document.body.appendChild(tooltip);

            const move = (e) => {
              tooltip.style.left = `${e.clientX + 12}px`;
              tooltip.style.top = `${e.clientY + 12}px`;
            };
            document.addEventListener("mousemove", move);
            arg.el._tooltipMove = move;
          }}
          eventMouseLeave={(arg) => {
            document.getElementById("fc-tooltip")?.remove();
            document.removeEventListener("mousemove", arg.el._tooltipMove);
          }}
          eventClick={(arg) => {
            // remove existing tooltip if open
            document.getElementById("fc-tooltip")?.remove();

            const rect = arg.el.getBoundingClientRect();
            const tooltip = document.createElement("div");
            tooltip.className = "fc-tooltip";
            tooltip.id = "fc-tooltip";
            tooltip.innerHTML = `
             <div><strong>${arg.event.extendedProps.name}</strong></div>
             <div>Amount: ${arg.event.title}</div>
             <div>Type: ${arg.event.extendedProps.type}</div>
           `;

            document.body.appendChild(tooltip);

            // position below the event
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.bottom + 8}px`;

            // close on outside tap/click
            const close = (e) => {
              if (!tooltip.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener("click", close);
              }
            };
            setTimeout(() => document.addEventListener("click", close), 0);
          }}
        />
      </div>
    </div>
  );
}
