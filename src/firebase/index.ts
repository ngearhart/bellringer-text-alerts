import { initializeApp } from 'firebase/app'

export const firebaseApp = initializeApp({
    apiKey: "AIzaSyBC5R5IteQpeITUNaQlUoWihq0mpa5hTRY",
    // https://firebase.google.com/docs/auth/web/redirect-best-practices#web-modular-api
    // Fix Safari issue
    authDomain: "text-alerts.bellringer.noahgearhart.com",  // TODO: figure out how to change this locally
    databaseURL: "https://bellringer-text-alerts-default-rtdb.firebaseio.com",
    projectId: "bellringer-text-alerts",
    storageBucket: "bellringer-text-alerts.appspot.com",
    messagingSenderId: "1054901026357",
    appId: "1:1054901026357:web:4731efba0fcfe7354a7b7c"
})

// used for the firestore refs
// const db = getFirestore(firebaseApp)

// here we can export reusable database references
// export const todosRef = collection(db, 'todos')
