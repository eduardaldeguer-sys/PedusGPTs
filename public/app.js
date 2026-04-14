async function send() {
  const input = document.getElementById("input");
  const chat = document.getElementById("chat");

  const msg = input.value;
  if (!msg) return;

  chat.innerHTML += `<div class="user">${msg}</div>`;
  input.value = "";

  const res = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: msg })
  });

  const data = await res.json();

  chat.innerHTML += `<div class="bot">${data.content}</div>`;
}
