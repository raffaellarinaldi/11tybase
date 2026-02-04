const messages = require('languages')

function getLocalizedMessages(lang = 'en') {
  return messages[lang]?.form?.messages || messages.en.form.messages
}

async function handleNetlifyFormSubmit({ formElement, onSuccess, onError, debug, hideButton = true }) {
  const formData = new FormData(formElement)

  function hideSubmitButton() {
    const buttons = formElement.querySelectorAll('[type="submit"], #submit')
    buttons.forEach(btn => {
      btn.style.display = 'none'
    })
  }

  if (debug) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (Math.random() > 0.5) {
          onSuccess()
          if (hideButton) hideSubmitButton()
          resolve()
        } else {
          onError()
          resolve()
        }
      }, 500)
    })
  }

  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString()
    })
    if (!response.ok) {
      onError()
      return
    }
    onSuccess()
    hideSubmitButton()
  } catch {
    onError()
  }
}

module.exports = {
  handleNetlifyFormSubmit,
  getLocalizedMessages
}
