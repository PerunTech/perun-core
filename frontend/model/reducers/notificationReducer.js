export default function notificationReducer (state = {
  notifications: undefined
}, action) {
  switch (action.type) {
    case 'NOTIFICATION_DATA_PENDING': {
      return {
        ...state, count: undefined, notification: undefined
      }
    }
    case 'NOTIFICATION_DATA_FULFILLED': {
      // let count
      // let notifications = []
      // console.log(action.message.data)
      // if (action.message && action.message.type === "SUCCESS") {
      // notifications.push(action.message.data)
      // }
      return {
        ...state, notifications: action.message.data
      }
    }
    case 'NOTIFICATION_DATA_REJECTED': {
      return {
        ...state, error: action.notifications
      }
    }
  }
  return state
}
