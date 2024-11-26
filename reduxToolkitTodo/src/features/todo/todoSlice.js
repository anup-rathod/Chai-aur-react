import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  todos: [{ id: 1, text: "Hello world" }],
};
console.log(initialState.todos)
// Output: [{ id: 1, text: "Hello world" }]

export const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    addTodo: (state, action) => {
      const todo = {
        id: nanoid(),
        text: action.payload,
      };
      state.todos.push(todo);
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload);
    },

    editTodo: (state, action) => {
      const { id, text } = action.payload;
      state.todos = state.todos.map((todo) =>
        todo.id === id ? { ...todo, text } : todo
      );
    },
  },
});

export const { addTodo, removeTodo, editTodo } = todoSlice.actions;
console.log(editTodo(initialState, { payload: { id: 1, text: "Modified text" } }));
// Output: { todos: [{ id: 1, text: "Modified text" }] }
console.log(initialState.todos)
// Output: [{ id: 1, text: "Hello world" }]
export default todoSlice.reducer;
