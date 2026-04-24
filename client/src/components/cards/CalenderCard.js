// src/components/PayCalendar.jsx
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useContext, useEffect, useState } from "react";
import { userContext } from "../../App";
import { getAllRecurring } from "../../utils/API/recurring";
// import interactionPlugin from "@fullcalendar/interaction";
// import "./PayCalendar.css"; // optional for extra styles

export default function CalendarCard() {
  const { user, setUser, token } = useContext(userContext);
  const [events, setEvents] = useState([]);

  // TODO fix how calendar get recurring, should get all dates and predict future dates. Bonus: adhock predict dates on next button click on calander

  const getRecurring = async (token) => {
    return await getAllRecurring(token);
  };

  useEffect(() => {
    if (!user || !token || !user.selected_account_id) return;
    const paydays = [];
    const bills = [];
    getRecurring(token).then((events) => {
      console.log(events);
      events.forEach((e) => {
        if (e.type === "PAYMENT") {
          paydays.push({
            title: `+$${Number(e.amount).toLocaleString()}`,
            date: e.next_due,
            extendedProps: {
              type: e.type.toLowerCase(),
              amount: e.amount,
            },
          });
        }
        if (e.type === "BILL") {
          paydays.push({
            title: `-$${Number(e.amount).toLocaleString()}`,
            date: e.next_due,
            extendedProps: {
              type: e.type.toLowerCase(),
              amount: e.amount,
            },
          });
        }
      });

      setEvents([...paydays, ...bills]);
    });

    // const paydays =
    //   user.income?.map((i) => ({
    //     title: /* i.name */ `+$${Number(i.amount).toLocaleString()}`,
    //     date: i.predicted_next_pay.split("T")[0],
    //     extendedProps: {
    //       type: "payday",
    //       amount: i.amount,
    //     },
    //   })) ?? [];

    // const bills =
    //   user.bills?.map((b) => ({
    //     title: /* b.name */ `-$${Number(b.amount).toLocaleString()}`,
    //     date: b.next_due.split("T")[0],
    //     extendedProps: {
    //       type: "bill",
    //       amount: b.amount,
    //     },
    //   })) ?? [];
  }, [user]);

  // console.log(user.bills);
  return (
    <div className="window-style">
      <h3 className="style-text text-center text-opacity-75">
        Finance Calendar
      </h3>
      <div id="calendar" className="calendar">
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
            // console.log(arg.date);
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
