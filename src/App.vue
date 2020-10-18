<template>
  <div id="app">
    <TodoList />
  </div>
</template>

<script>
import TodoList from "./components/TodoList";
import Calendar from "v-calendar/lib/components/calendar.umd";
import DatePicker from "v-calendar/lib/components/date-picker.umd";

export default {
  name: "app",
  components: {
    TodoList,
    Calendar,
    DatePicker,
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@300&display=swap");
* {
  margin: 0;
  padding: 0;
  font-family: "Montserrat", sans-serif;
}
body {
  max-width: 100vw;
  min-height: 100vh;
  background: #ffdee9;
  background: linear-gradient(0deg, #cfd9df 0%, #e2ebf0 100%);
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
}
</style>
