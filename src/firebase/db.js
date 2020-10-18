import firebase from "firebase";
import 'firebase/firestore';

var config = {
    apiKey: "AIzaSyBOl3mcbpvjSpFx3LdUfp5XKFvc2InGdBE",
    authDomain: "garageapi-73596.firebaseapp.com",
    databaseURL: "https://garageapi-73596.firebaseio.com",
    projectId: "garageapi-73596",
    storageBucket: "garageapi-73596.appspot.com",
    messagingSenderId: "94572466711",
    appId: "1:94572466711:web:03069bdb3ef5b861d40252"
};
export const db = firebase.initializeApp(config).firestore()
