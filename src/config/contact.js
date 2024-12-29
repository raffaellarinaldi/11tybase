(function (global) {
  global.setupFormHandler = function ({ 
    formElement, 
    successMessageElement, 
    errorMessageElement, 
    hiddenClass = 'd-none' 
  }) {
    const handleSubmit = (e) => {
      e.preventDefault()
      successMessageElement.classList.add(hiddenClass)
      errorMessageElement.classList.add(hiddenClass)

      let formData = new FormData(formElement)

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      })
        .then(() => {
          successMessageElement.classList.remove(hiddenClass)
          formElement.reset()
        })
        .catch(() => {
          errorMessageElement.classList.remove(hiddenClass)
        })
    }

    formElement.addEventListener('submit', handleSubmit)
  }
})(window)
