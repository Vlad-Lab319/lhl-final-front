import axios from "axios";
import { useEffect } from "react";
import io from "socket.io-client";
import useStateManager from "./useStateManager";

export default function useApplicationData() {
  const { state, dispatch, r } = useStateManager();
  // --------------------------INITIALIZE DATA----------------------------------

  const initialFetch = (user) => {
    if (user.id) {
      Promise.all([
        axios.get(`/api/users/`),
        axios.get(`/api/rooms/${user.id}`),
        axios.get(`/api/channels/${user.id}`),
        axios.get(`/api/messages/`),
        axios.get(`/api/users/friends/${user.id}`),
        axios.get(`/api/users/friends/requests/${user.id}`),
      ]).then((all) => {
        const [users, rooms, channels, messages, friends, friendRequests] = all;
        dispatch({
          type: r.SET_APPLICATION_DATA,
          value: {
            users: users.data,
            rooms: rooms.data,
            channels: channels.data,
            messages: messages.data,
            friends: friends.data,
            friendRequests: friendRequests.data,
          },
        });
      });
    }
  };

  const socketMan = (user) => {
    if (user.id) {
      const socket = io(process.env.REACT_APP_WEBSOCKET_URL);
      socket.connect().emit("updateActiveUsers", {
        type: r.SET_ACTIVE_USERS,
        value: user,
      });

      setSocket(socket);

      socket.on("sendfriendrequest", (action) => {
        dispatch({ type: action.type, value: action.value });
      });

      socket.on("cancelfriendrequest", (action) => {
        dispatch({ type: action.type, value: action.value });
      });

      socket.on("acceptfriendrequest", (action) => {
        dispatch({ type: action.type, value: action.value });
      });

      socket.on("updateRooms", (id) => {
        axios.get(`/api/rooms/${state.user.id}`).then((rooms) => {
          dispatch({
            type: r.SET_ROOMS,
            value: rooms.data,
          });
          dispatch({
            type: r.SET_ROOM,
            value: rooms.data.find((room) => room.id === id.id) || {},
          });
        });
      });

      socket.on("updateChannels", () => {
        axios.get(`/api/channels/${user.id}`).then((channels) => {
          dispatch({
            type: r.SET_CHANNELS,
            value: channels.data,
          });
        });
      });

      socket.on("message", (message) => {
        dispatch({
          type: r.ADD_MESSAGES,
          value: message,
        });
      });

      socket.on("channel", (channel) => {
        dispatch({
          type: r.ADD_CHANNELS,
          value: channel,
        });
      });

      socket.on("updateActiveUsers", (action) => {
        dispatch({
          type: action.type,
          value: action.value,
        });
      });

      // return () => socket.disconnect();
    }
  };

  useEffect(() => {
    initialFetch(state.user);
    socketMan(state.user);
  }, [state.user.id]);

  //-------------------------LOGIN/LOGOUT---------------------------------------
  const registerUser = (name, email, password) => {
    clearErrors();
    axios
      .post(`api/users/register`, {
        name,
        email,
        password,
      })
      .then((user) => {
        dispatch(user.data.action);
      });
  };
  // TODO: UNCOMMENT - uncomment for deploy
  const loginUser = (id) => {
    clearErrors();
    axios.get(`api/users/login/${id}`).then((user) => {
      dispatch(user.data.action);
    });
  };
  // const loginUser = (email, password) => {
  //   clearErrors();
  //   axios.post(`api/users/login`, { email, password }).then((user) => {
  //     dispatch(user.data.action);
  //   });
  // };
  const logoutUser = () => {
    dispatch({ type: r.SET_USER, value: { id: null } });
    if (state.socket) {
      state.socket.disconnect();
    }
  };
  const clearErrors = () => {
    dispatch({ type: r.SET_ERRORS, value: null });
  };

  // ---------------------------STATE SETTERS-----------------------------------
  const setChannel = (channel, room, user) => {
    dispatch({ type: r.SET_CHANNEL, value: channel });
    dispatch({
      type: r.SET_USER,
      value: { ...user, room_id: room.id, channel_id: channel.id },
    });
    state.socket.emit("updateActiveUsers", {
      type: r.SET_ACTIVE_USERS,
      value: {
        ...user,
        room_id: room.id,
        channel_id: channel.id,
      },
    });
  };

  const setRecipient = (recipient) => {
    dispatch({ type: r.SET_RECIPIENT, value: recipient });
  };

  const setRoom = (channel, room, user) => {
    state.directMessage &&
      dispatch({ type: r.TOGGLE_DIRECT_MESSAGE, value: !state.directMessage });
    dispatch({ type: r.SET_ROOM, value: room });
    dispatch({ type: r.SET_CHANNEL, value: {} });
    dispatch({
      type: r.SET_USER,
      value: { ...user, room_id: room.id, channel_id: channel.id },
    });
    state.socket.emit("updateActiveUsers", {
      type: r.SET_ACTIVE_USERS,
      value: {
        ...user,
        room_id: room.id,
        channel_id: channel.id,
      },
    });
  };

  const setSocket = (socket) => {
    dispatch({ type: r.SET_SOCKET, value: socket });
  };

  const toggleDirectMessage = () => {
    dispatch({ type: r.TOGGLE_DIRECT_MESSAGE, value: !state.directMessage });
    setRoom({}, {}, state.user);
    setChannel({}, {}, state.user);
  };

  // -----------------------------WEBSOCKET-------------------------------------

  const sendFriendRequest = (user_id, friend_id) => {
    axios.post("/api/users/friends/add", { user_id, friend_id }).then(() => {
      state.socket.emit("sendfriendrequest", { value: { user_id, friend_id } });
    });
  };

  const cancelFriendRequest = (user_id, friend_id) => {
    axios.post("/api/users/friends/delete", { user_id, friend_id }).then(() => {
      state.socket.emit("cancelfriendrequest", {
        value: { user_id, friend_id },
      });
    });
  };

  const acceptFriendRequest = (user_id, friend_id) => {
    axios.post("/api/users/friends/accept", { user_id, friend_id }).then(() => {
      state.socket.emit("acceptfriendrequest", {
        value: { user_id, friend_id },
      });
      state.socket.emit("cancelfriendrequest", {
        value: { user_id, friend_id },
      });
    });
  };

  const sendMessage = (messageData) => {
    return axios.post(`/api/messages`, messageData).then((message) => {
      dispatch({
        type: r.ADD_MESSAGES,
        value: message.data[0],
      });
      state.socket.emit("message", message.data[0]);
    });
  };

  const createRoom = (roomData) => {
    return axios.post(`/api/rooms`, roomData).then((room) => {
      dispatch({
        type: r.ADD_ROOMS,
        value: room.data[0],
      });
    });
  };

  const editRoom = (name, id) => {
    return axios.post(`/api/rooms/edit`, { name, id }).then(() => {
      state.socket.emit("updateRooms", { id });
    });
  };

  const deleteRoom = (id) => {
    return axios.post(`/api/rooms/delete`, { id }).then(() => {
      state.socket.emit("updateRooms", { id });
    });
  };

  const editChannel = (name, id) => {
    return axios.post(`/api/channels/edit`, { name, id }).then(() => {
      state.socket.emit("updateChannels");
    });
  };

  const deleteChannel = (id) => {
    return axios.post(`/api/channels/delete`, { id }).then(() => {
      state.socket.emit("updateChannels");
    });
  };

  const createChannel = (channelData) => {
    return axios.post(`/api/channels`, channelData).then((channel) => {
      dispatch({
        type: r.ADD_CHANNELS,
        value: channel.data[0],
      });
      state.socket.emit("channel", channel.data[0]);
    });
  };

  const addUserToRoom = (id, room) => {
    return axios
      .post("/api/rooms/adduser", { userID: id, roomID: room.id })
      .then(state.socket.emit("updateRooms", { id: room.id }));
  };

  return {
    state,
    setChannel,
    setRoom,
    loginUser,
    logoutUser,
    sendMessage,
    setRecipient,
    registerUser,
    createRoom,
    createChannel,
    clearErrors,
    addUserToRoom,
    editRoom,
    editChannel,
    deleteRoom,
    deleteChannel,
    toggleDirectMessage,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
  };
}
