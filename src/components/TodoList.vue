<template>
  <div class="projects-container">
    <input
      type="text"
      class="todo-input"
      placeholder="press enter to add new project"
      v-model="newProject"
      @keyup.enter="addProject"
    />
    <div class="project" v-for="(project, index) in projects" :key="project.id">
      <div
        v-if="!project.editing"
        @dblclick="editProject(project)"
        class="project-title"
      >
        {{ project.projectName }}
        <div class="remove-item" @click="removeProject(project)">
          <i class="far fa-trash-alt"></i>
        </div>
      </div>
      <input
        v-else
        class="todo-item-edit project-edit"
        type="text"
        @blur="doneEditProject(project)"
        @keyup.enter="doneEditProject(project)"
        v-model="project.projectName"
        v-focus
      />

      <input
        type="text"
        class="todo-input"
        placeholder="add new task"
        v-model="newTodo[index]"
        @keyup.enter="addTodo(newTodo[index], project.id)"
      />

      <div v-for="todo in todos" :key="todo.id" class="todos-container">
        <div v-if="project.id == todo.project_id" class="todo">
          <div class="todo-item-left">
            <input
              type="checkbox"
              @change="completedTodo(todo)"
              v-model="todo.completed"
            />
            <div
              v-if="!todo.editing"
              @dblclick="editTodo(todo)"
              class="todo-item-label"
              :class="{ completed: todo.completed }"
            >
              {{ todo.title }}
            </div>
            <input
              v-else
              class="todo-item-edit"
              type="text"
              @blur="doneEditTodo(todo)"
              @keyup.enter="doneEditTodo(todo)"
              v-model="todo.title"
              v-focus
            />
          </div>
          <div class="todo-icons">
            <div class="remove-item">
              <!-- <v-date-picker
                class="deadline"
                v-model="todo.deadline"
                :popover="{ placement: 'bottom', visibility: 'click' }"
                :input="getDate(todo)"
              >
                <button>
                  <i class="far fa-clock"></i></button
              ></v-date-picker> -->
            </div>
            <div class="arrows">
              <div @click="moveUpTodo(todo, project)" class="">
                <i class="fas fa-arrow-up"></i>
              </div>
              <div @click="moveDownTodo(todo, project)" class="">
                <i class="fas fa-arrow-down"></i>
              </div>
            </div>
            <div class="remove-item remove-todo" @click="removeTodo(todo)">
              &times;
            </div>
          </div>
        </div>
        <div v-if="project.id == todo.project_id">
          <p>
            deadline:
            <input
              class="deadline"
              type="date"
              v-model="todo.deadline"
              @change="getDate(todo)"
              :min="nowDate"
            />
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script >
import { db } from "../firebase/db";
import moment from "moment";
export default {
  name: "TodoList",
  data() {
    return {
      nowDate: moment(new Date()).format("YYYY-MM-DD"),
      date: "",
      newTodo: [],
      todos: [],
      newProject: "",
      projects: [],
    };
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      },
    },
  },
  methods: {
    async addProject() {
      if (
        this.newProject.trim().length == 0 ||
        this.newProject.trim().length > 35
      ) {
        return;
      }
      await db.collection("projects").add({
        projectName: this.newProject.trim(),
        editing: false,
      });
      this.newProject = "";
    },
    async addTodo(todo, id) {
      if (todo === undefined) {
        return;
      } else if (todo.trim().length == 0 || todo.trim().length > 35) {
        return;
      }
      const snapshot = await db
        .collection("todos")
        .where("project_id", "==", id)
        .get();
      await db.collection("todos").add({
        project_id: id,
        title: todo.trim(),
        editing: false,
        completed: false,
        status: snapshot.docs.length + 1,
        deadline: new Date().toJSON().substr(0, 10),
      });
      this.newTodo = [];
    },
    removeTodo(todo) {
      db.collection("todos").doc(todo.id).delete();
      db.collection("todos")
        .where("project_id", "==", todo.project_id)
        .where("status", ">", todo.status)
        .get()
        .then((querySnapshot) =>
          querySnapshot.forEach((doc) =>
            doc.ref.update({ status: doc.data().status - 1 })
          )
        );
    },
    removeProject(project) {
      db.collection("projects").doc(project.id).delete();
      db.collection("todos")
        .where("project_id", "==", project.id)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            doc.ref.delete();
          });
        });
    },
    moveUpTodo(todo, project) {
      if (todo.status > 1) {
        db.collection("todos")
          .where("status", "==", todo.status - 1)
          .where("project_id", "==", project.id)
          .get()
          .then((querySnapshot) =>
            querySnapshot.forEach((doc) =>
              doc.ref.update({ status: doc.data().status + 1 })
            )
          );
        db.collection("todos")
          .where("status", "==", todo.status)
          .where("project_id", "==", project.id)
          .get()
          .then((querySnapshot) =>
            querySnapshot.forEach((doc) =>
              doc.ref.update({ status: doc.data().status - 1 })
            )
          );
      }
    },
    async moveDownTodo(todo, project) {
      const snapshot = await db
        .collection("todos")
        .where("project_id", "==", todo.project_id)
        .where("project_id", "==", project.id)
        .get();
      if (todo.status < snapshot.docs.length) {
        db.collection("todos")
          .where("status", "==", todo.status + 1)
          .where("project_id", "==", project.id)
          .get()
          .then((querySnapshot) =>
            querySnapshot.forEach((doc) =>
              doc.ref.update({ status: doc.data().status - 1 })
            )
          );
        db.collection("todos")
          .where("status", "==", todo.status)
          .get()
          .then((querySnapshot) =>
            querySnapshot.forEach((doc) =>
              doc.ref.update({ status: doc.data().status + 1 })
            )
          );
      }
    },
    editTodo(todo) {
      todo.editing = true;
    },
    doneEditTodo(todo) {
      todo.editing = false;
      if (todo.title.trim() == "") {
        db.collection("todos").doc(todo.id).delete();
      } else if (todo.title.trim().length > 40) {
        return;
      }
      db.collection("todos").doc(todo.id).update({ title: todo.title.trim() });
    },
    editProject(project) {
      project.editing = true;
    },
    doneEditProject(project) {
      project.editing = false;
      if (project.projectName.trim() == "") {
        db.collection("projects").doc(project.id).delete();
      } else if (project.projectName.trim().length > 40) {
        return;
      }
      db.collection("projects")
        .doc(project.id)
        .update({ projectName: project.projectName });
    },
    completedTodo(todo) {
      db.collection("todos").doc(todo.id).update({ completed: todo.completed });
    },
    cancelEdit(todo) {
      todo.editing = false;
    },
    getDate(todo) {
      let formatedDate = moment(todo.deadline).format("YYYY-MM-DD");
      db.collection("todos").doc(todo.id).update({ deadline: formatedDate });
    },
  },
  firestore: {
    projects: db.collection("projects").orderBy("projectName"),
    todos: db.collection("todos").orderBy("status"),
  },
};
</script>

<style>
.projects-container {
  width: 660px;
  margin: 0 auto;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.project-input {
  margin: 20px;
  max-width: 100%;
  height: 50px;
  border: 0px;
  border-radius: 25px;
  cursor: pointer;
  background: #449775;
  color: #fff;
  font-size: 18px;
}
.project {
  display: flex;
  flex-direction: column;
  width: 660px;
}
.project-input:hover {
  background: #3b7d86;
}
.project-input:focus {
  outline: none;
}
.todo {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.project-title {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  font-size: 32px;
  font-weight: 900;
}
.todo-input {
  max-width: 100%;
  height: 35px;
  padding: 20px;
  font-size: 18px;
  margin-bottom: 16px;
  border: 0px;
  border-bottom: 1px solid #000;
  background: inherit;
}

.project-edit {
  font-size: 32px !important;
  padding: 20px !important;
  margin-left: 0px !important;
}
.todo-input:focus {
  outline: 0;
}
.todos-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}
.remove-item {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.remove-todo {
  font-size: 50px;
}
.remove-item:hover {
  color: #000;
}
.fa-clock {
  font-size: 20px;
}
.todo-icons {
  display: flex;
  justify-content: center;
  align-items: center;
}
.todo-item-left {
  display: flex;
  align-items: center;
}
.todo-item-label {
  padding: 10px;
  margin-left: 12px;
}
.todo-item-edit {
  max-width: 100%;
  font-size: 24px;
  padding: 10px;
  border: 0px;
  margin-left: 12px;
  background: inherit;
}
.arrows {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
  font-size: 19px;
  color: #2c3e50;
}
.fa-arrow-up,
.fa-arrow-down {
  height: 18px;
}
.fa-arrow-up:hover,
.fa-arrow-down:hover {
  color: #000;
}
.completed {
  text-decoration: line-through;
  color: #666;
}
p {
  overflow: hidden;
  text-align: center;
  font-size: 12px;
}
p:before,
p:after {
  background-color: #000;
  content: "";
  display: inline-block;
  height: 1px;
  position: relative;
  vertical-align: middle;
  width: 50%;
}
p:before {
  right: 0.5em;
  margin-left: -50%;
}
p:after {
  left: 0.5em;
  margin-right: -50%;
}

.deadline {
  background: inherit;
  border: 0px;
  width: 125px;
}

.deadline:focus {
  outline: none;
}
</style>