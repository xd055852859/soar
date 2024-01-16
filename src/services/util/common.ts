import { Notify } from "quasar";
export const setMessage = (type: string, text: string) => {
  let icon: string = "";
  let color: string = "";
  switch (type) {
    case "success":
      icon = "done";
      color = "positive";
      break;
    case "error":
      icon = "error";
      color = "negative";
      break;
    case "warning":
      icon = "warning";
      color = "warning";
      break;
  }
  Notify.create({
    icon: icon,
    color: color,
    message: text,
    position: "top",
  });
};
