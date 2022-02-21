import { useReducer } from "react";

export default function useStateManager() {
  const reducerVariables = {
    SET_SOCKET: "SET_SOCKET",
    SET_USER: "SET_USER",
    SET_USERS: "SET_USERS",
    SET_ROOM: "SET_ROOM",
    SET_ROOMS: "SET_ROOMS",
    SET_CHANNEL: "SET_CHANNEL",
    SET_CHANNELS: "SET_CHANNELS",
    SET_FRIENDS: "SET_FRIENDS",
    SET_RECIPIENT: "SET_RECIPIENT",
    ADD_MESSAGES: "ADD_MESSAGES",
    ADD_ROOMS: "ADD_ROOMS",
    ADD_CHANNELS: "ADD_CHANNELS",
    SET_APPLICATION_DATA: "SET_APPLICATION_DATA",
    SET_ERRORS: "SET_ERRORS",
    SET_ACTIVE_USERS: "SET_ACTIVE_USERS",
    TOGGLE_DIRECT_MESSAGE: "TOGGLE_DIRECT_MESSAGE",
    SET_FRIEND_REQUEST: "SET_FRIEND_REQUEST",
    CANCEL_FRIEND_REQUEST: "CANCEL_FRIEND_REQUEST",
    ADD_FRIEND: "ADD_FRIEND",
  };

  const r = reducerVariables;

  const initialState = {
    user: { id: null },
    users: {},
    activeUsers: {},
    socket: null,
    room: {},
    channel: {},
    rooms: [],
    channels: [],
    friends: [],
    recipient: {},
    members: [],
    messages: [],
    errors: null,
    friendRequests: [],
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  function reducer(state, action) {
    switch (action.type) {
      case r.SET_SOCKET:
        return {
          ...state,
          socket: action.value,
        };
      case r.SET_USER:
        return {
          ...state,
          user: action.value,
        };
      case r.SET_ACTIVE_USERS:
        return {
          ...state,
          activeUsers: action.value,
        };
      case r.SET_USERS:
        return {
          ...state,
          users: action.value,
        };
      case r.SET_ROOM:
        return {
          ...state,
          room: action.value,
        };
      case r.SET_ROOMS:
        return {
          ...state,
          rooms: action.value,
        };
      case r.SET_CHANNEL:
        return {
          ...state,
          channel: action.value,
        };
      case r.SET_CHANNELS:
        return {
          ...state,
          channels: action.value,
        };
      case r.SET_FRIENDS:
        return {
          ...state,
          friends: action.value,
        };
      case r.SET_RECIPIENT:
        return {
          ...state,
          recipient: action.value,
        };
      case r.ADD_MESSAGES:
        return {
          ...state,
          messages: [...state.messages, action.value],
        };
      case r.ADD_ROOMS:
        return {
          ...state,
          rooms: [...state.rooms, action.value],
        };
      case r.ADD_CHANNELS:
        return {
          ...state,
          channels: [...state.channels, action.value],
        };
      case r.SET_APPLICATION_DATA:
        return {
          ...state,
          users: action.value.users,
          rooms: action.value.rooms,
          channels: action.value.channels,
          friends: action.value.friends,
          messages: action.value.messages,
          friendRequests: action.value.friendRequests,
        };
      case r.SET_ERRORS:
        return {
          ...state,
          errors: action.value,
        };
      case r.TOGGLE_DIRECT_MESSAGE:
        return {
          ...state,
          directMessage: action.value,
        };
      case r.SET_FRIEND_REQUEST:
        return {
          ...state,
          friendRequests: [...state.friendRequests, action.value],
        };
      case r.CANCEL_FRIEND_REQUEST:
        const currentFriendRequests = [...state.friendRequests];
        const newFriendRequests = currentFriendRequests.filter((request) => {
          return action.value.to.id !== request.to.id;
        });
        return {
          ...state,
          friendRequests: [...newFriendRequests],
        };
      case r.ADD_FRIEND:
        return {
          ...state,
          friends: [...state.friends, action.value],
        };
      default:
        return { ...state };
    }
  }

  return { state, dispatch, r };
}
