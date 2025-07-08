const firebaseConfig = {
  apiKey: "AIzaSyCrnuVZLIs6DiZ7exEdrez59OsktcMA-iU",
  authDomain: "dailyquiz-8149b.firebaseapp.com",
  projectId: "dailyquiz-8149b",
  storageBucket: "dailyquiz-8149b.appspot.com",
  messagingSenderId: "814257864320",
  appId: "1:814257864320:web:98e911b3ca5a643407b065"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const allowedEmails = [
  "arrahmanallamalquraan123@gmail.com",
  "imranraza12738@gmail.com"
];

auth.onAuthStateChanged(user => {
  const adminSection = document.getElementById("admin-section");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const status = document.getElementById("status");

  if (user && allowedEmails.includes(user.email)) {
    status.innerText = `✅ Welcome, ${user.email}`;
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    adminSection.style.display = "block";
    showTab('set');
  } else {
    status.innerText = user ? "❌ Access Denied" : "Please Login";
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    adminSection.style.display = "none";
  }
});

document.getElementById("login-btn").onclick = () => {
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
};
document.getElementById("logout-btn").onclick = () => {
  auth.signOut();
};

function showTab(tab) {
  document.querySelectorAll(".tab-content").forEach(t => t.style.display = "none");
  document.getElementById(`tab-${tab}`).style.display = "block";
  if (tab === "view") loadAnswers();
  if (tab === "schedule") loadSchedule();
}

function saveQuiz() {
  const date = document.getElementById("quiz-date").value;
  const time = document.getElementById("quiz-time").value;
  const id = `${date}T${time}`;
  const question = document.getElementById("quiz-question").value;
  const a = document.getElementById("opt-a").value;
  const b = document.getElementById("opt-b").value;
  const c = document.getElementById("opt-c").value;
  const d = document.getElementById("opt-d").value;
  const correct = document.getElementById("correct-option").value;
  const msg = document.getElementById("quiz-msg");

  if (!date || !time || !question || !a || !b || !c || !d || !correct) {
    msg.innerText = "⚠️ Fill all fields!";
    return;
  }

  db.collection("quiz_questions").doc(id).set({
    question,
    options: { a, b, c, d },
    correct
  }).then(() => {
    msg.innerText = "✅ Saved!";
  }).catch(err => {
    msg.innerText = "❌ Error: " + err.message;
  });
}

function loadAnswers() {
  const table = document.getElementById("answers-table");
  table.innerHTML = "";
  db.collection("quiz_answers").orderBy("date", "desc").get().then(snapshot => {
    snapshot.forEach(doc => {
      const d = doc.data();
      const correct = d.correct ? "✅" : "❌";
      table.innerHTML += `<tr>
        <td>${d.date}</td>
        <td>${d.name || '-'}</td>
        <td>${d.phone || '-'}</td>
        <td>${d.address || '-'}</td>
        <td>${d.answer}</td>
        <td>${correct}</td>
      </tr>`;
    });
  });
}

function loadSchedule() {
  const table = document.getElementById("schedule-table");
  table.innerHTML = "";
  db.collection("quiz_questions").get().then(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      table.innerHTML += `<tr>
        <td>${doc.id.replace("T", " @ ")}</td>
        <td>${data.question.slice(0, 50)}...</td>
        <td><button onclick="deleteQuiz('${doc.id}')">🗑 Delete</button></td>
      </tr>`;
    });
  });
}

function deleteQuiz(id) {
  if (confirm("Are you sure to delete?")) {
    db.collection("quiz_questions").doc(id).delete().then(() => loadSchedule());
  }
}

document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("dark-mode");
};
