const handleFormSubmit = async (event, endpoint, messageSpanId) => {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const jsonData = {};
  formData.forEach((value, key) => (jsonData[key] = value));

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    const result = await response.json();
    const messageSpan = document.getElementById(messageSpanId);

    if (response.ok) {
      messageSpan.style.color = "green";
      localStorage.setItem('token', result);
      window.location = "/user";
    } else {
      messageSpan.style.color = "red";
      messageSpan.textContent = result.message;
    }
  } catch (error) {
    const messageSpan = document.getElementById(messageSpanId);
    messageSpan.style.color = "red";
    messageSpan.textContent = "An error occurred. Please try again later.";
  }
};



export { handleFormSubmit };
