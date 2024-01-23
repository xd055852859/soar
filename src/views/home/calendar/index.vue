<script setup lang="ts">
import cHeader from "@/components/common/cHeader.vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import cnLocale from "@fullcalendar/core/locales/zh-cn";
import _ from "lodash";
const dayjs: any = inject("dayjs");
const calendarRef = ref<any>(null);
const calendarDate = ref<any>([
  dayjs().subtract(1, "month").startOf("month").startOf("day").valueOf(),
  dayjs().add(1, "month").endOf("month").endOf("day").valueOf(),
]);
const infoVisible = ref<boolean>(false);
const createSchedule = () => {};
const changeDate = (type) => {
  switch (type) {
    case "left":
      calendarRef.value.getApi().prev();
      break;
    case "right":
      calendarRef.value.getApi().next();
      break;
    case "today":
      calendarRef.value.getApi().today();
      break;
    case "month":
      calendarRef.value.getApi().changeView("dayGridMonth");
      break;
    case "week":
      calendarRef.value.getApi().changeView("timeGridWeek");
      break;
    case "day":
      calendarRef.value.getApi().changeView("timeGridDay");
      break;
    case "list":
      calendarRef.value.getApi().changeView("list");
      break;
  }
  let view = calendarRef.value.getApi().view;
  calendarDate.value = [
    dayjs(view.currentStart).startOf("day").valueOf(),
    dayjs(view.currentEnd).endOf("day").valueOf(),
  ];
};
</script>
<template>
  <div class="calendar">
    <cHeader title="日程" />
    <div class="calendar-box">
      <!--               // if (
                //   (headerIndex === 3 && groupInfo.role < 4) ||
                //   headerIndex !== 3
                // ) {
                //   if (calendarGroupArray.length > 0) {
                //     setInfoVisible(true);
                //   } else {
                //     // dispatch(
                //     //   setMessage(true, '没有共同群可以创建日程', "error")
                //     // );
                //   }
                // } else {
                //   // dispatch(setMessage(true, "权限不够无法创建", "error"));
                // } -->
      <FullCalendar
        ref="calendarRef"
        :options="{
          height: '100%',
          buttonText: {
            today: '今日',
            month: '月',
            week: '周',
            day: '日',
            list: '列表',
          },
          locale: cnLocale,
          plugins: [
            dayGridPlugin,
            timeGridPlugin,
            listPlugin,
            interactionPlugin,
          ],
          initialView: 'dayGridMonth',
          headerToolbar: {
            left: 'prevButton,nextButton todayButton createButton',
            center: 'title',
            right: 'monthButton,weekButton,dayButton,listButton',
          },
          customButtons: {
            createButton: {
              text: '创建日程(会议)',
              click: createSchedule,
            },
            prevButton: {
              icon: 'chevron-left',
              click: () => changeDate('left'),
            },
            nextButton: {
              icon: 'chevron-right',
              click: () => changeDate('right'),
            },
            todayButton: {
              text: '今日',
              click: () => changeDate('today'),
            },
            monthButton: {
              text: '月',
              click: () => changeDate('month'),
            },
            weekButton: {
              text: '周',
              click: () => changeDate('week'),
            },
            dayButton: {
              text: '日',
              click: () => changeDate('day'),
            },
            listButton: {
              text: '列表',
              click: () => changeDate('list'),
            },
          },
        }"
      />
    </div>
    <cDialog
      :visible="infoVisible"
      title="创建日程"
      @close="infoVisible = false"
    >
      <template #content>
      <div>
        
      </div>
      </template>
    </cDialog>
  </div>
</template>
<style scoped lang="scss">
.calendar {
  width: 100%;
  height: 100%;
  .calendar-box {
    width: 100%;
    height: calc(100% - 70px);
    @include scroll();
    @include p-number(10px, 25px);
  }
}
</style>
<style></style>
